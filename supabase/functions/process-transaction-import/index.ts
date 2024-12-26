import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting transaction import process...');
    
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false
        }
      }
    );

    // Get request body
    const { fileName } = await req.json();
    console.log('Processing file:', fileName);

    if (!fileName) {
      throw new Error('No file name provided');
    }

    // Download file from storage
    console.log('Downloading file from storage...');
    const { data: fileData, error: downloadError } = await supabaseClient
      .storage
      .from('imports')
      .download(fileName);

    if (downloadError) {
      console.error('Download error:', downloadError);
      throw downloadError;
    }

    const text = await fileData.text();
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    console.log(`Processing ${lines.length} lines from file...`);

    const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
    console.log('CSV Headers:', headers);

    // Validate required headers
    const requiredHeaders = [
      'agreement_number',
      'customer_name',
      'amount',
      'license_plate',
      'vehicle',
      'payment_date',
      'payment_method',
      'payment_number',
      'payment_description'
    ];
    
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    if (missingHeaders.length > 0) {
      console.error('Missing required headers:', missingHeaders);
      throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`);
    }

    const errors = [];
    const processedRows = [];

    // Process each row
    for (let i = 1; i < lines.length; i++) {
      console.log(`Processing row ${i}...`);
      
      if (!lines[i].trim()) continue;

      const values = lines[i].split(',').map(v => v.trim());
      const row = headers.reduce((obj: any, header, index) => {
        obj[header] = values[index];
        return obj;
      }, {});

      try {
        // Validate amount
        const amount = parseFloat(row.amount);
        if (isNaN(amount)) {
          throw new Error(`Invalid amount format in row ${i}: ${row.amount}`);
        }

        // Validate date
        const paymentDate = new Date(row.payment_date);
        if (isNaN(paymentDate.getTime())) {
          throw new Error(`Invalid date format in row ${i}: ${row.payment_date}`);
        }

        // Create transaction record
        const transaction = {
          type: 'income',
          amount: amount,
          description: `${row.payment_description} (Agreement: ${row.agreement_number})`,
          transaction_date: paymentDate.toISOString(),
          reference_type: 'agreement',
          reference_id: row.agreement_number,
          status: 'completed',
          metadata: {
            customer_name: row.customer_name,
            license_plate: row.license_plate,
            vehicle: row.vehicle,
            payment_method: row.payment_method,
            payment_number: row.payment_number
          }
        };

        processedRows.push(transaction);
        console.log(`Successfully processed row ${i}`);

      } catch (error) {
        console.error(`Error processing row ${i}:`, error);
        errors.push({
          row: i,
          error: error.message,
          data: row
        });
      }
    }

    console.log(`Processed ${processedRows.length} rows with ${errors.length} errors`);

    // Insert valid rows
    if (processedRows.length > 0) {
      console.log('Inserting processed transactions...');
      const { error: insertError } = await supabaseClient
        .from('accounting_transactions')
        .insert(processedRows);

      if (insertError) {
        console.error('Insert error:', insertError);
        throw insertError;
      }
      console.log('Successfully inserted transactions');
    }

    // Update import log
    console.log('Updating import log...');
    await supabaseClient
      .from('transaction_imports')
      .insert({
        file_name: fileName,
        status: errors.length === 0 ? 'completed' : 'completed_with_errors',
        records_processed: processedRows.length,
        errors: errors.length > 0 ? errors : null
      });

    console.log('Import process completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        processed: processedRows.length,
        errors
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error processing import:', error);
    return new Response(
      JSON.stringify({
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});
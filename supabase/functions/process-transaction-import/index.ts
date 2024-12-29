import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const requiredHeaders = [
  'Lease_ID',
  'Customer_Name',
  'Amount',
  'License_Plate',
  'Vehicle',
  'Payment_Date',
  'Payment_Method',
  'Transaction_ID',
  'Description',
  'Type',
  'Status'
];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting transaction import processing...');
    
    // Parse request body
    const { fileName } = await req.json();
    
    if (!fileName) {
      throw new Error('Missing fileName in request body');
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Downloading file:', fileName);

    // Download file from storage
    const { data: fileData, error: downloadError } = await supabaseClient.storage
      .from('imports')
      .download(fileName);

    if (downloadError) {
      console.error('Storage download error:', downloadError);
      throw downloadError;
    }

    // Process the file content
    const fileContent = await fileData.text();
    const lines = fileContent.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    if (lines.length < 2) {
      throw new Error('File is empty or contains only headers');
    }

    // Validate headers
    const headers = lines[0].split(',').map(h => h.trim());
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    
    if (missingHeaders.length > 0) {
      throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`);
    }

    console.log('Headers validated successfully');

    // Process rows
    const validRows = [];
    const errors = [];
    let totalAmount = 0;

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split(',').map(v => v.trim());
        const rowData = {};
        
        headers.forEach((header, index) => {
          rowData[header] = values[index];
        });

        // Validate required fields
        if (!rowData.Amount || isNaN(Number(rowData.Amount))) {
          throw new Error('Invalid amount');
        }

        if (!rowData.Status || !['pending', 'completed', 'failed', 'refunded'].includes(rowData.Status.toLowerCase())) {
          throw new Error('Invalid status');
        }

        // Store in raw_transaction_imports
        const { error: insertError } = await supabaseClient
          .from('raw_transaction_imports')
          .insert({
            import_id: crypto.randomUUID(),
            raw_data: rowData,
            is_valid: true,
            payment_method: rowData.Payment_Method,
            payment_description: rowData.Description,
            license_plate: rowData.License_Plate,
            vehicle_details: rowData.Vehicle
          });

        if (insertError) {
          console.error('Error storing raw import:', insertError);
          throw insertError;
        }

        validRows.push(rowData);
        totalAmount += Number(rowData.Amount);

      } catch (error) {
        console.error(`Error processing row ${i}:`, error);
        errors.push({
          row: i,
          message: error.message,
          data: lines[i]
        });
      }
    }

    console.log('Processing complete:', {
      totalRows: lines.length - 1,
      validRows: validRows.length,
      errorCount: errors.length
    });

    return new Response(
      JSON.stringify({
        success: true,
        totalRows: lines.length - 1,
        validRows: validRows.length,
        invalidRows: errors.length,
        totalAmount,
        errors: errors.length > 0 ? errors : null,
        suggestions: errors.length > 0 ? [
          'Review and correct invalid rows before proceeding',
          'Ensure all amounts are valid numbers',
          'Verify date format (YYYY-MM-DD) for all entries',
          'Check that Status values are one of: pending, completed, failed, refunded'
        ] : []
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Import process error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
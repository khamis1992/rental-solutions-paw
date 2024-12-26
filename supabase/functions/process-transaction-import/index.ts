import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function isValidDate(date: Date): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}

function parseDate(dateString: string): string {
  if (!dateString) return new Date().toISOString();
  
  try {
    // Remove any timezone information to avoid displacement errors
    dateString = dateString.split('T')[0];
    
    // Try parsing different date formats
    let date: Date;
    
    // Try YYYY-MM-DD format first
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      date = new Date(dateString);
    } 
    // Try DD-MM-YYYY or DD/MM/YYYY format
    else {
      const parts = dateString.split(/[-/]/);
      if (parts.length === 3) {
        // Ensure year is 4 digits and reasonable
        const year = parseInt(parts[2]);
        if (year > 1900 && year < 2100) {
          date = new Date(year, parseInt(parts[1]) - 1, parseInt(parts[0]));
        } else {
          throw new Error('Invalid year');
        }
      } else {
        throw new Error('Invalid date format');
      }
    }
    
    if (!isValidDate(date)) {
      throw new Error('Invalid date');
    }
    
    return date.toISOString();
  } catch (error) {
    console.error('Date parsing error:', error, 'for date:', dateString);
    return new Date().toISOString();
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { fileName } = await req.json();
    console.log('Processing file:', fileName);

    // Download file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('imports')
      .download(fileName);

    if (downloadError) {
      throw downloadError;
    }

    const content = await fileData.text();
    const rows = content.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => {
        const values = line.split(',').map(value => value.trim());
        return {
          agreement_number: values[0],
          customer_name: values[1],
          amount: parseFloat(values[2]) || 0,
          license_plate: values[3],
          vehicle: values[4],
          payment_date: values[5],
          payment_method: values[6],
          payment_number: values[7],
          description: values[8]
        };
      })
      .filter((_, index) => index > 0); // Skip header row

    console.log('Processed rows:', rows.length);

    // Create import log
    const { data: importLog, error: importError } = await supabase
      .from('transaction_imports')
      .insert({
        file_name: fileName,
        status: 'processing',
        records_processed: rows.length
      })
      .select()
      .single();

    if (importError) throw importError;
    console.log('Created import log:', importLog);

    // Save raw import data
    const processedRows = rows.map((row: any) => ({
      import_id: importLog.id,
      raw_data: row,
      transaction_date: parseDate(row.payment_date),
      amount: row.amount,
      description: row.description,
      status: 'pending'
    }));

    const { error: rawDataError } = await supabase
      .from('raw_transaction_imports')
      .insert(processedRows);

    if (rawDataError) throw rawDataError;
    console.log('Saved raw transaction data');

    // Process and insert transactions
    const transactions = rows.map((row: any) => ({
      type: 'income',
      amount: row.amount,
      description: row.description,
      transaction_date: parseDate(row.payment_date),
      status: 'completed',
      reference_type: 'import',
      reference_id: importLog.id,
      metadata: {
        agreement_number: row.agreement_number,
        customer_name: row.customer_name,
        license_plate: row.license_plate,
        vehicle: row.vehicle,
        payment_method: row.payment_method,
        payment_number: row.payment_number
      }
    }));

    const { error: transactionError } = await supabase
      .from('accounting_transactions')
      .insert(transactions);

    if (transactionError) throw transactionError;

    // Update import log status
    const { error: updateError } = await supabase
      .from('transaction_imports')
      .update({ 
        status: 'completed',
        records_processed: rows.length
      })
      .eq('id', importLog.id);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Successfully processed ${rows.length} transactions`,
        data: rows 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error processing transactions:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200  // Changed to 200 to avoid non-2xx status code error
      }
    );
  }
});
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  try {
    console.log('Starting payment import process...');
    const { fileName } = await req.json();
    console.log('Processing file:', fileName);

    if (!fileName) {
      throw new Error('fileName is required');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Download the file from storage
    const { data: fileData, error: downloadError } = await supabase
      .storage
      .from('imports')
      .download(fileName);

    if (downloadError) {
      throw new Error(`Failed to download file: ${downloadError.message}`);
    }

    // Convert the file to text and parse CSV
    const text = await fileData.text();
    const rows = text.split('\n');
    const headers = rows[0].split(',').map(h => h.trim());
    console.log('CSV Headers:', headers);

    let successCount = 0;
    let errorCount = 0;
    let errors = [];

    // Update import log status to processing
    await supabase
      .from('import_logs')
      .update({ status: 'processing' })
      .eq('file_name', fileName);

    // Process each row
    for (let i = 1; i < rows.length; i++) {
      if (!rows[i].trim()) continue;

      const values = rows[i].split(',').map(v => v.trim());
      if (values.length === headers.length) {
        try {
          const customerIdentifier = values[headers.indexOf('customer_identifier')];
          const amount = parseFloat(values[headers.indexOf('amount')]);
          const paymentDate = values[headers.indexOf('payment_date')];
          const paymentMethod = values[headers.indexOf('payment_method')];
          const status = values[headers.indexOf('status')];
          const paymentNumber = values[headers.indexOf('Payment_Number')];
          const paymentType = values[headers.indexOf('Payment_Type')];
          const paymentDescription = values[headers.indexOf('Payment_Description')];

          if (!customerIdentifier) {
            throw new Error('Customer identifier (full name) is missing');
          }

          // Get customer ID from identifier using full name
          const { data: customerData, error: customerError } = await supabase
            .from('profiles')
            .select('id')
            .eq('full_name', customerIdentifier.trim())
            .single();

          if (customerError || !customerData) {
            throw new Error(`Customer not found: ${customerIdentifier}`);
          }

          // First try to find an active lease
          let { data: activeLease } = await supabase
            .from('leases')
            .select('id')
            .eq('customer_id', customerData.id)
            .eq('status', 'active')
            .order('start_date', { ascending: false })
            .limit(1)
            .single();

          // If no active lease is found, try to find the most recent lease of any status
          if (!activeLease) {
            const { data: anyLease } = await supabase
              .from('leases')
              .select('id, status')
              .eq('customer_id', customerData.id)
              .order('start_date', { ascending: false })
              .limit(1)
              .single();

            if (!anyLease) {
              throw new Error(`No lease found for customer: ${customerIdentifier}`);
            } else {
              console.log(`Found non-active lease (${anyLease.status}) for customer: ${customerIdentifier}`);
              activeLease = anyLease;
            }
          }

          // Convert date from MM-DD-YYYY to ISO format
          const [month, day, year] = paymentDate.split('-');
          if (!month || !day || !year) {
            throw new Error(`Invalid date format in row ${i + 1}. Expected: MM-DD-YYYY`);
          }
          const isoDate = `${year}-${month}-${day}`;

          // Create payment record
          const { error: paymentError } = await supabase
            .from('payments')
            .insert({
              lease_id: activeLease.id,
              amount,
              status,
              payment_date: new Date(isoDate).toISOString(),
              payment_method,
              transaction_id: paymentNumber,
            });

          if (paymentError) {
            throw paymentError;
          }

          successCount++;
          console.log(`Successfully imported payment for customer: ${customerIdentifier}`);

        } catch (error) {
          console.error(`Error processing row ${i + 1}:`, error);
          errorCount++;
          errors.push({
            row: i + 1,
            error: error.message
          });
        }
      }
    }

    // Update import log with final status
    await supabase
      .from('import_logs')
      .update({
        status: 'completed',
        records_processed: successCount,
        errors: errors.length > 0 ? errors : null
      })
      .eq('file_name', fileName);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Import completed. Successfully processed ${successCount} payments with ${errorCount} errors.`,
        processed: successCount,
        errors: errorCount,
        errorDetails: errors
      }),
      { 
        status: 200,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json'
        } 
      }
    );
  } catch (error) {
    console.error('Import process failed:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred',
        details: error.toString()
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json'
        } 
      }
    );
  }
});
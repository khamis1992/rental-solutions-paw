import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { processPaymentRow } from './paymentUtils.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
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
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Download file in chunks
    const { data: fileData, error: downloadError } = await supabase
      .storage
      .from('imports')
      .download(fileName);

    if (downloadError) {
      console.error('Download error:', downloadError);
      throw new Error(`Failed to download file: ${downloadError.message}`);
    }

    const text = await fileData.text();
    const rows = text.split('\n').map(row => row.trim()).filter(row => row.length > 0);
    const headers = rows[0].split(',').map(h => h.trim());
    console.log('CSV Headers:', headers);

    let successCount = 0;
    let errorCount = 0;
    let errors = [];
    let skippedCustomers = [];

    // Update status to processing
    await supabase
      .from('import_logs')
      .update({ status: 'processing' })
      .eq('file_name', fileName);

    // Process in smaller batches
    const BATCH_SIZE = 10;
    for (let i = 1; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      const batchPromises = batch.map(async (row) => {
        if (!row.trim()) return null;

        const values = row.split(',').map(v => v.trim());
        console.log(`Processing row ${i}:`, values);
        
        if (values.length === headers.length) {
          try {
            const result = await processPaymentRow(supabase, headers, values);
            if (result.success) {
              successCount++;
            } else {
              if (result.error?.includes('No active lease found')) {
                skippedCustomers.push({
                  customerName: values[headers.indexOf('Customer Name')],
                  amount: values[headers.indexOf('Amount')],
                  paymentDate: values[headers.indexOf('Payment_Date')],
                  reason: result.error
                });
              } else {
                errorCount++;
                errors.push({
                  row: i + 1,
                  error: result.error
                });
              }
            }
          } catch (error) {
            console.error(`Error processing row ${i}:`, error);
            errorCount++;
            errors.push({
              row: i + 1,
              error: error.message
            });
          }
        }
      });

      // Wait for batch to complete
      await Promise.all(batchPromises);
    }

    // Update import log with results
    await supabase
      .from('import_logs')
      .update({
        status: 'completed',
        records_processed: successCount,
        errors: {
          failed: errors,
          skipped: skippedCustomers
        }
      })
      .eq('file_name', fileName);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Import completed. Successfully processed ${successCount} payments. ${skippedCustomers.length} payments skipped due to missing customers.`,
        processed: successCount,
        skipped: skippedCustomers.length,
        errors: errorCount,
        skippedDetails: skippedCustomers,
        errorDetails: errors
      }),
      { 
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
        success: false,
        error: error.message || 'An unexpected error occurred',
        details: error.toString()
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 500
      }
    );
  }
});
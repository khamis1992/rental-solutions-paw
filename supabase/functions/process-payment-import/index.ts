import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { processPaymentRow } from './paymentUtils.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
};

const BATCH_SIZE = 50; // Process 50 rows at a time

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
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

    // Download file
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

    // Update import log status to processing
    await supabase
      .from('import_logs')
      .update({ status: 'processing' })
      .eq('file_name', fileName);

    // Process rows in batches
    for (let i = 1; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil((rows.length - 1) / BATCH_SIZE)}`);

      const batchResults = await Promise.all(
        batch.map(async (row, index) => {
          if (!row.trim()) return null;

          const values = row.split(',').map(v => v.trim());
          console.log(`Processing row ${i + index}:`, values);
          
          if (values.length === headers.length) {
            return await processPaymentRow(supabase, headers, values);
          }
          return null;
        })
      );

      // Process batch results
      batchResults.forEach((result, index) => {
        if (!result) return;

        if (result.success) {
          successCount++;
        } else {
          if (result.error?.includes('No active lease found')) {
            const rowIndex = i + index;
            const values = rows[rowIndex].split(',').map(v => v.trim());
            skippedCustomers.push({
              customerName: values[headers.indexOf('Customer Name')],
              amount: values[headers.indexOf('Amount')],
              paymentDate: values[headers.indexOf('Payment_Date')],
              reason: result.error
            });
          } else {
            errorCount++;
            errors.push({
              row: i + index + 1,
              error: result.error
            });
          }
        }
      });

      // Give the worker a small break between batches
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Update import log with final status
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
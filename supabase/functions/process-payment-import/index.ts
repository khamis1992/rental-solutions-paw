import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { processPaymentRow } from './paymentUtils.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
};

const BATCH_SIZE = 50; // Process 50 payments at a time

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

    await supabase
      .from('import_logs')
      .update({ status: 'processing' })
      .eq('file_name', fileName);

    // Process rows in batches
    const dataRows = rows.slice(1); // Skip header row
    for (let i = 0; i < dataRows.length; i += BATCH_SIZE) {
      console.log(`Processing batch ${Math.floor(i/BATCH_SIZE) + 1} of ${Math.ceil(dataRows.length/BATCH_SIZE)}`);
      
      const batch = dataRows.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(
        batch.map(async (row, index) => {
          if (!row.trim()) return null;

          const values = row.split(',').map(v => v.trim());
          if (values.length !== headers.length) return null;

          try {
            const result = await processPaymentRow(supabase, headers, values);
            if (result.success) {
              return { type: 'success' };
            } else {
              if (result.error?.includes('No active lease found')) {
                return {
                  type: 'skipped',
                  data: {
                    customerName: values[headers.indexOf('Customer Name')],
                    amount: values[headers.indexOf('Amount')],
                    paymentDate: values[headers.indexOf('Payment_Date')],
                    reason: result.error
                  }
                };
              }
              return {
                type: 'error',
                data: {
                  row: i + index + 2, // +2 for header row and 0-based index
                  error: result.error
                }
              };
            }
          } catch (error) {
            return {
              type: 'error',
              data: {
                row: i + index + 2,
                error: error.message
              }
            };
          }
        })
      );

      // Aggregate batch results
      batchResults.forEach(result => {
        if (!result) return;
        
        switch (result.type) {
          case 'success':
            successCount++;
            break;
          case 'skipped':
            skippedCustomers.push(result.data);
            break;
          case 'error':
            errorCount++;
            errors.push(result.data);
            break;
        }
      });

      // Update progress after each batch
      await supabase
        .from('import_logs')
        .update({
          records_processed: successCount,
          errors: {
            failed: errors,
            skipped: skippedCustomers
          }
        })
        .eq('file_name', fileName);
    }

    // Mark import as completed
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
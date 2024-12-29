import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { analysisResult, forceImport = false } = await req.json();
    
    // When force import is true, we'll process all rows that have the minimum required data
    const rowsToProcess = forceImport ? 
      (analysisResult.rows || []).filter((row: any) => row.amount && row.payment_date) :
      (analysisResult.validRows || []);

    if (!Array.isArray(rowsToProcess)) {
      console.error('Invalid rows format:', rowsToProcess);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid data format',
          details: 'Rows to process must be an array'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    console.log('Processing import with rows:', {
      totalRows: rowsToProcess.length,
      forceImport
    });

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Process in batches of 100
    const batchSize = 100;
    const results = [];
    const errors = [];

    for (let i = 0; i < rowsToProcess.length; i += batchSize) {
      const batch = rowsToProcess.slice(i, i + batchSize);
      try {
        console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(rowsToProcess.length / batchSize)}`);
        
        // Prepare the batch data
        const processedBatch = batch.map(row => ({
          amount: parseFloat(row.amount) || 0,
          payment_date: row.payment_date,
          payment_method: row.payment_method || 'unknown',
          transaction_id: row.transaction_id,
          status: 'pending'
        }));

        const { data, error } = await supabaseClient
          .from('payments')
          .insert(processedBatch)
          .select();

        if (error) {
          console.error('Batch insert error:', error);
          errors.push({
            batch: Math.floor(i / batchSize) + 1,
            error: error.message,
            failedRows: batch.length
          });
        } else {
          results.push(...(data || []));
          console.log(`Successfully processed ${data?.length || 0} rows in batch`);
        }
      } catch (batchError) {
        console.error('Batch processing error:', batchError);
        errors.push({
          batch: Math.floor(i / batchSize) + 1,
          error: batchError.message,
          failedRows: batch.length
        });
      }
    }

    // Create detailed processing report
    const processingReport = {
      totalProcessed: results.length,
      successfulBatches: Math.floor(results.length / batchSize),
      failedBatches: errors.length,
      totalErrors: errors.reduce((sum, err) => sum + err.failedRows, 0),
      errorDetails: errors,
      forceImported: forceImport
    };

    console.log('Processing complete:', processingReport);

    return new Response(
      JSON.stringify({
        success: true,
        processed: results.length,
        report: processingReport,
        errors: errors.length > 0 ? errors : undefined
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error processing payment import:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'An error occurred during processing',
        success: false
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
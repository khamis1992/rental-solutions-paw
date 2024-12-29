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
    const { analysisResult } = await req.json();
    console.log('Processing import with analysis result:', {
      totalRows: analysisResult?.validRows?.length,
      totalInvalid: analysisResult?.invalidRows?.length
    });

    if (!analysisResult?.validRows || !Array.isArray(analysisResult.validRows)) {
      return new Response(
        JSON.stringify({ 
          error: 'Valid rows must be an array',
          received: analysisResult
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Process in batches of 100
    const batchSize = 100;
    const results = [];
    const errors = [];
    const validRows = analysisResult.validRows;

    for (let i = 0; i < validRows.length; i += batchSize) {
      const batch = validRows.slice(i, i + batchSize);
      try {
        console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(validRows.length / batchSize)}`);
        
        const { data, error } = await supabaseClient
          .from('payments')
          .insert(batch)
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
      errorDetails: errors
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
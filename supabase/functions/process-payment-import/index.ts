import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { rows, importId, skipValidation = false } = await req.json();
    console.log('Received request:', { rowCount: rows?.length, importId, skipValidation });

    // Validate input
    if (!Array.isArray(rows)) {
      console.error('Invalid rows format:', rows);
      return new Response(
        JSON.stringify({
          error: "Rows must be an array",
          success: false
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
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
    let processedCount = 0;

    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      try {
        // Process each row in the batch
        const processedBatch = batch.map(row => {
          try {
            if (!row || typeof row !== 'object') {
              throw new Error('Invalid row format');
            }

            // Basic data validation and cleaning
            const amount = parseFloat(row.amount);
            if (isNaN(amount)) {
              throw new Error('Invalid amount format');
            }

            return {
              amount,
              payment_date: row.payment_date || null,
              payment_method: row.payment_method || 'unknown',
              transaction_id: row.transaction_id || null,
              status: 'pending',
              lease_id: row.lease_id || null
            };
          } catch (rowError) {
            // Log error but continue processing other rows
            console.error('Row processing error:', rowError, row);
            errors.push({
              row: i + batch.indexOf(row),
              error: rowError.message,
              data: row
            });
            return null;
          }
        }).filter(row => row !== null);

        if (processedBatch.length > 0) {
          const { data, error: insertError } = await supabaseClient
            .from('payments')
            .insert(processedBatch)
            .select();

          if (insertError) {
            console.error('Batch insert error:', insertError);
            errors.push({
              batch: Math.floor(i / batchSize) + 1,
              error: insertError.message,
              failedRows: processedBatch.length
            });
          } else {
            results.push(...(data || []));
            processedCount += processedBatch.length;
          }
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

    // Log import results
    if (importId) {
      const { error: logError } = await supabaseClient
        .from('import_logs')
        .update({
          status: errors.length > 0 ? 'completed_with_errors' : 'completed',
          records_processed: processedCount,
          errors: errors.length > 0 ? errors : null
        })
        .eq('id', importId);

      if (logError) {
        console.error('Error updating import log:', logError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: processedCount,
        errors: errors.length > 0 ? errors : undefined,
        details: `Successfully processed ${processedCount} records with ${errors.length} errors`
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
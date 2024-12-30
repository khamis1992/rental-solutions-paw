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
    const { rows, importId, skipValidation = false } = await req.json();
    
    if (!Array.isArray(rows)) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid data format',
          details: 'Rows must be an array'
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

    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      try {
        // Prepare the batch data with minimal processing
        const processedBatch = batch.map(row => ({
          amount: parseFloat(row.amount) || 0,
          payment_date: row.payment_date || null,
          payment_method: row.payment_method || 'unknown',
          transaction_id: row.transaction_id || null,
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

    return new Response(
      JSON.stringify({
        success: true,
        processed: results.length,
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
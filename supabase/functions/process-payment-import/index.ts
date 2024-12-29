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
    console.log('Processing import with analysis result:', analysisResult);

    if (!analysisResult?.rows || !Array.isArray(analysisResult.rows)) {
      throw new Error('Valid rows must be an array');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Format the rows for insertion
    const formattedRows = analysisResult.rows.map((row: any) => ({
      agreement_number: String(row.Agreement_Number || '').trim(),
      license_plate: String(row.License_Plate || '').trim(),
      rent_amount: parseFloat(row.Rent_Amount) || 0,
      final_price: parseFloat(row.Final_Price) || 0,
      amount_paid: parseFloat(row.Amount_Paid) || 0,
      remaining_amount: parseFloat(row.Remaining_Amount) || 0,
      agreement_duration: row.Agreement_Duration || null,
      import_status: 'pending'
    }));

    console.log('Formatted rows for import:', formattedRows);

    // Process in batches of 100
    const batchSize = 100;
    const results = [];
    const errors = [];

    for (let i = 0; i < formattedRows.length; i += batchSize) {
      const batch = formattedRows.slice(i, i + batchSize);
      try {
        const { data, error } = await supabaseClient
          .from('remaining_amounts')
          .insert(batch)
          .select();

        if (error) {
          console.error('Batch insert error:', error);
          errors.push({
            batch: Math.floor(i / batchSize) + 1,
            error: error.message
          });
        } else {
          results.push(...(data || []));
        }
      } catch (batchError) {
        console.error('Batch processing error:', batchError);
        errors.push({
          batch: Math.floor(i / batchSize) + 1,
          error: batchError.message
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
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
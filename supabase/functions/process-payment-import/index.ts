import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

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
    const { rows } = await req.json();
    
    // Validate that rows is an array
    if (!Array.isArray(rows)) {
      console.error('Invalid rows format:', rows);
      throw new Error('Valid rows must be an array');
    }

    console.log('Processing payment import with rows:', rows.length);

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Process rows in batches
    const batchSize = 50;
    const results = [];
    const errors = [];

    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      console.log(`Processing batch ${i / batchSize + 1}:`, batch);

      const { data, error } = await supabaseClient
        .from('financial_imports')
        .insert(batch.map((row: any) => ({
          lease_id: row.lease_id,
          customer_name: row.customer_name,
          amount: row.amount,
          license_plate: row.license_plate,
          vehicle: row.vehicle,
          payment_date: row.payment_date,
          payment_method: row.payment_method,
          transaction_id: row.transaction_id,
          description: row.description,
          type: row.type,
          status: row.status
        })))
        .select();

      if (error) {
        console.error('Batch insert error:', error);
        errors.push({
          batch: i / batchSize + 1,
          error: error.message,
          details: error.details
        });
      } else {
        results.push(...(data || []));
      }
    }

    // Log the final results
    console.log('Import completed:', {
      totalProcessed: results.length,
      errors: errors.length
    });

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
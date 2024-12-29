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

    // Process each valid row
    const { data, error } = await supabaseClient
      .from('financial_imports')
      .insert(rows.map((row: any) => ({
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
      })));

    if (error) {
      console.error('Error inserting data:', error);
      throw error;
    }

    console.log('Successfully imported payments:', data);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully imported ${rows.length} payments`,
        data
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
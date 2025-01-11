import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  try {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing environment variables');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Server configuration error' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const requestData = await req.json();
    const { operation, data } = requestData;
    
    console.log('Processing payment request:', { operation, data });

    if (operation !== 'process_payment') {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid operation'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const { leaseId, amount, paymentMethod = 'Cash', description = '', type } = data;

    // Validate required parameters
    if (!leaseId || !amount || !type) {
      console.error('Missing required parameters:', { leaseId, amount, type });
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required parameters'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Direct insert into payments table
    const { data: payment, error: insertError } = await supabase
      .from('payments')
      .insert({
        lease_id: leaseId,
        amount: amount,
        amount_paid: amount,
        balance: 0,
        payment_method: paymentMethod,
        description: description,
        type: type,
        status: 'completed',
        payment_date: new Date().toISOString(),
        include_in_calculation: true
      })
      .select()
      .single();

    if (insertError) {
      console.error('Payment insert error:', insertError);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to process payment',
          details: insertError
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log('Payment processed successfully:', payment);

    return new Response(
      JSON.stringify({
        success: true,
        data: payment
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Payment service error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
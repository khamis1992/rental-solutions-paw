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
        JSON.stringify({ success: false, error: 'Missing environment variables' }),
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
          error: 'Invalid operation',
          details: { operation }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    if (!data) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing payment data'
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
          error: 'Missing required parameters',
          details: { leaseId, amount, type }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log('Calling process_payment with parameters:', {
      input_lease_id: leaseId,
      input_amount: amount,
      input_payment_method: paymentMethod,
      input_description: description,
      input_type: type
    });

    // Call the process_payment function
    const { data: result, error: functionError } = await supabase
      .rpc('process_payment', {
        input_lease_id: leaseId,
        input_amount: amount,
        input_payment_method: paymentMethod,
        input_description: description,
        input_type: type
      });

    if (functionError) {
      console.error('Payment processing error:', functionError);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to process payment',
          details: functionError
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log('Payment processed successfully:', result);

    return new Response(
      JSON.stringify({
        success: true,
        data: result
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Payment service error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error',
        details: error
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
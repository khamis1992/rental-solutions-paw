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

    // Verify lease exists before proceeding
    console.log('Verifying lease:', leaseId);
    const { data: lease, error: leaseError } = await supabase
      .from('leases')
      .select('id, agreement_number')
      .eq('id', leaseId)
      .single();

    if (leaseError) {
      console.error('Lease verification error:', leaseError);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid lease ID or lease not found',
          details: leaseError
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid amount',
          details: { amount }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Create payment with explicit table alias to avoid ambiguous column references
    const { data: payment, error: paymentError } = await supabase
      .from('payments AS p')
      .insert({
        lease_id: leaseId,
        amount: numericAmount,
        payment_method: paymentMethod,
        description: description,
        status: 'completed',
        payment_date: new Date().toISOString(),
        amount_paid: numericAmount,
        balance: 0,
        type: type
      })
      .select(`
        p.id,
        p.lease_id,
        p.amount,
        p.payment_method,
        p.status,
        p.payment_date,
        p.description,
        p.type,
        leases:p.lease_id (
          agreement_number
        )
      `)
      .single();

    if (paymentError) {
      console.error('Payment creation error:', paymentError);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to create payment',
          details: paymentError
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log('Payment created successfully:', payment);

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
        error: error.message || 'Internal server error',
        details: error
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
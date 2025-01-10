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

    // Validate environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing environment variables:', { supabaseUrl: !!supabaseUrl, supabaseKey: !!supabaseKey });
      throw new Error('Missing environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Log request details for debugging
    console.log('Request method:', req.method);
    console.log('Request headers:', Object.fromEntries(req.headers.entries()));
    
    // Parse and validate request data
    const requestData = await req.json();
    console.log('Received payment request:', requestData);

    const { operation, data } = requestData;
    
    if (operation !== 'process_payment') {
      console.error('Invalid operation:', operation);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid operation',
          details: { operation }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    const { leaseId, amount, paymentMethod = 'Cash', description = '', type } = data;

    // Validate required fields with type checking
    if (!leaseId || typeof leaseId !== 'string') {
      console.error('Invalid leaseId:', leaseId);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing or invalid leaseId',
          details: { leaseId }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    // Verify lease exists before proceeding
    const { data: lease, error: leaseError } = await supabase
      .from('leases')
      .select('id, agreement_number')
      .eq('id', leaseId)
      .single();

    if (leaseError || !lease) {
      console.error('Lease verification error:', leaseError);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid lease ID or lease not found',
          details: leaseError
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      console.error('Invalid amount:', amount);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid amount',
          details: { amount }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    if (!type || !['Income', 'Expense'].includes(type)) {
      console.error('Invalid payment type:', type);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid payment type',
          details: { type }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    console.log('Creating payment with data:', {
      lease_id: leaseId,
      amount: numericAmount,
      payment_method: paymentMethod,
      description,
      type
    });

    // Create payment with explicit field selection
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
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
      .select()
      .single();

    if (paymentError) {
      console.error('Payment creation error:', paymentError);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to create payment',
          details: paymentError
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    console.log('Payment created successfully:', payment);

    return new Response(
      JSON.stringify({
        success: true,
        data: payment
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Payment service error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error',
        details: error
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
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
      return new Response(null, { 
        headers: corsHeaders 
      });
    }

    // Log request details
    console.log('Request method:', req.method);
    console.log('Request headers:', Object.fromEntries(req.headers.entries()));
    
    // Validate environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing environment variables:', {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey
      });
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Server configuration error',
          details: 'Missing required environment variables'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }

    // Create Supabase client with error handling
    let supabase;
    try {
      supabase = createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: false
        }
      });
      console.log('Supabase client created successfully');
    } catch (error) {
      console.error('Failed to create Supabase client:', error);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Database connection error',
          details: error instanceof Error ? error.message : 'Unknown error'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      );
    }

    // Parse request body with error handling
    let requestData;
    try {
      const text = await req.text();
      console.log('Raw request body:', text);
      requestData = JSON.parse(text);
      console.log('Parsed request data:', requestData);
    } catch (error) {
      console.error('Request parsing error:', error);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid request format',
          details: error instanceof Error ? error.message : 'Failed to parse request body'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    const { operation, data } = requestData;
    
    if (operation !== 'process_payment') {
      console.error('Invalid operation requested:', operation);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid operation',
          details: { operation, supported: ['process_payment'] }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    // Validate payment data
    if (!data) {
      console.error('Missing payment data in request');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing payment data'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    const { leaseId, amount, paymentMethod = 'Cash', description = '', type } = data;

    // Validate required fields
    if (!leaseId || typeof leaseId !== 'string') {
      console.error('Invalid leaseId provided:', { leaseId, type: typeof leaseId });
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid lease ID format',
          details: { leaseId, expectedType: 'string' }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    // Verify lease exists
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
          error: 'Failed to verify lease',
          details: leaseError
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    if (!lease) {
      console.error('Lease not found:', leaseId);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Lease not found',
          details: { leaseId }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404
        }
      );
    }

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      console.error('Invalid amount:', { amount, parsed: numericAmount });
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid amount',
          details: { amount, reason: 'Must be a positive number' }
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
          details: { type, allowed: ['Income', 'Expense'] }
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

    // Create payment
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
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
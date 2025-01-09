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
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request body
    const requestData = await req.json();
    console.log('Received payment request:', requestData);

    // Validate required fields
    const { leaseId, amount, paymentMethod, description } = requestData;
    
    if (!leaseId || amount === undefined || amount === null) {
      console.error('Missing required fields:', { leaseId, amount });
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required fields',
          details: { leaseId, amount }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    // Validate lease exists
    const { data: lease, error: leaseError } = await supabase
      .from('leases')
      .select('id, agreement_number')
      .eq('id', leaseId)
      .single();

    if (leaseError) {
      console.error('Lease validation error:', leaseError);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid lease ID',
          details: leaseError
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    // Create payment with explicit field selection
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        lease_id: leaseId,
        amount: amount,
        payment_method: paymentMethod || 'Cash',
        description: description,
        status: 'completed',
        payment_date: new Date().toISOString(),
        amount_paid: amount,
        balance: 0
      })
      .select(`
        id,
        amount,
        payment_method,
        description,
        status,
        payment_date,
        leases:lease_id (
          id,
          agreement_number,
          customer_id,
          profiles:customer_id (
            full_name
          )
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
        error: error.message || 'Internal server error'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
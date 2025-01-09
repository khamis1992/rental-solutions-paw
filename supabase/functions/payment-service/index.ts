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
    const { leaseId, amount, paymentMethod, description } = await req.json();
    console.log('Processing payment:', { leaseId, amount, paymentMethod, description });

    if (!leaseId || !amount) {
      throw new Error('Missing required fields');
    }

    // Validate lease exists
    const { data: lease, error: leaseError } = await supabase
      .from('leases')
      .select('id')
      .eq('id', leaseId)
      .single();

    if (leaseError) {
      console.error('Lease validation error:', leaseError);
      throw new Error('Invalid lease ID');
    }

    // Create payment
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        lease_id: leaseId,
        amount: amount,
        payment_method: paymentMethod,
        description: description,
        status: 'completed',
        payment_date: new Date().toISOString(),
      })
      .select(`
        id,
        amount,
        payment_method,
        description,
        status,
        payment_date,
        leases!inner (
          id,
          agreement_number,
          customer_id,
          profiles!inner (
            full_name
          )
        )
      `)
      .single();

    if (paymentError) {
      console.error('Payment creation error:', paymentError);
      throw new Error('Failed to create payment');
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: payment
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Payment service error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 400
      }
    );
  }
});
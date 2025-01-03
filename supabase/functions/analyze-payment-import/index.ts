import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Valid payment method types from the enum
const VALID_PAYMENT_METHODS = ['Invoice', 'Cash', 'WireTransfer', 'Cheque', 'Deposit', 'On_hold'] as const;
type PaymentMethodType = typeof VALID_PAYMENT_METHODS[number];

function normalizePaymentMethod(method: string): PaymentMethodType {
  // Convert to title case first
  const titleCase = method.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  
  // Handle special cases
  switch (titleCase) {
    case 'Cash':
      return 'Cash';
    case 'Wire':
    case 'Wiretransfer':
    case 'Wire Transfer':
      return 'WireTransfer';
    case 'Check':
    case 'Cheque':
      return 'Cheque';
    case 'Invoice':
      return 'Invoice';
    case 'Deposit':
      return 'Deposit';
    case 'Hold':
    case 'On Hold':
    case 'Onhold':
      return 'On_hold';
    default:
      throw new Error(`Invalid payment method: ${method}`);
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { rawPaymentId } = await req.json();
    console.log('Processing raw payment:', rawPaymentId);

    // Fetch raw payment data
    const { data: rawPayment, error: fetchError } = await supabase
      .from('raw_payment_imports')
      .select('*')
      .eq('id', rawPaymentId)
      .single();

    if (fetchError) {
      console.error('Error fetching raw payment:', fetchError);
      throw fetchError;
    }

    // Normalize payment method
    let normalizedPaymentMethod: PaymentMethodType;
    try {
      normalizedPaymentMethod = normalizePaymentMethod(rawPayment.Payment_Method);
      if (!VALID_PAYMENT_METHODS.includes(normalizedPaymentMethod)) {
        throw new Error(`Payment method ${normalizedPaymentMethod} is not valid`);
      }
    } catch (error) {
      console.error('Payment method normalization error:', error);
      throw error;
    }

    // Find the lease by agreement number
    const { data: lease, error: leaseError } = await supabase
      .from('leases')
      .select('*')
      .eq('agreement_number', rawPayment.Agreement_Number)
      .single();

    if (leaseError) {
      console.error('Error finding lease:', leaseError);
      return new Response(
        JSON.stringify({
          success: false,
          error: `No lease found for agreement number: ${rawPayment.Agreement_Number}`
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404
        }
      );
    }

    // Process payment
    const paymentData = {
      lease_id: lease.id,
      amount: parseFloat(rawPayment.Amount),
      payment_date: rawPayment.Payment_Date,
      payment_method: normalizedPaymentMethod,
      description: rawPayment.Description,
      status: 'completed',
      type: 'Income',
      transaction_id: rawPayment.Transaction_ID
    };

    const { error: insertError } = await supabase
      .from('payments')
      .insert(paymentData);

    if (insertError) {
      console.error('Error inserting payment:', insertError);
      throw insertError;
    }

    // Update raw payment status
    const { error: updateError } = await supabase
      .from('raw_payment_imports')
      .update({ is_valid: true })
      .eq('id', rawPaymentId);

    if (updateError) {
      console.error('Error updating raw payment:', updateError);
      throw updateError;
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Payment processed successfully',
        payment: paymentData
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error processing payment:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
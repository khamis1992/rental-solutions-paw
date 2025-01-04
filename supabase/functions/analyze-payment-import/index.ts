import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentData {
  Transaction_ID: string;
  Agreement_Number: string;
  Customer_Name: string;
  License_Plate: string;
  Amount: number;
  Payment_Method: string;
  Description: string;
  Payment_Date: string;
  Type: string;
  Status: string;
}

const normalizePaymentMethod = (method: string): string => {
  const methodMap: Record<string, string> = {
    'cash': 'Cash',
    'invoice': 'Invoice',
    'wire': 'WireTransfer',
    'wiretransfer': 'WireTransfer',
    'wire_transfer': 'WireTransfer',
    'cheque': 'Cheque',
    'check': 'Cheque',
    'deposit': 'Deposit',
    'onhold': 'On_hold',
    'on_hold': 'On_hold',
    'on-hold': 'On_hold'
  };

  const normalized = method.toLowerCase().replace(/[^a-z_]/g, '');
  return methodMap[normalized] || 'Cash';
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { payment } = await req.json();

    console.log('Analyzing payment:', payment);

    // Normalize payment method
    const normalizedPaymentMethod = normalizePaymentMethod(payment.Payment_Method);
    
    // Validate agreement exists
    const { data: agreement, error: agreementError } = await supabase
      .from('leases')
      .select('id, customer_id')
      .eq('agreement_number', payment.Agreement_Number)
      .single();

    if (agreementError) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Agreement ${payment.Agreement_Number} not found`,
          shouldCreateAgreement: true
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404
        }
      );
    }

    // Prepare normalized payment data
    const normalizedPayment = {
      ...payment,
      Payment_Method: normalizedPaymentMethod,
      lease_id: agreement.id,
      is_valid: true
    };

    return new Response(
      JSON.stringify({
        success: true,
        normalizedPayment,
        agreement
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error in analyze-payment-import:', error);
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
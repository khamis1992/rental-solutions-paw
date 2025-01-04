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

serve(async (req: Request) => {
  try {
    console.log('Starting payment analysis...');

    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Validate environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing environment variables');
      throw new Error('Missing Supabase environment variables');
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse and validate request body
    let requestData;
    try {
      requestData = await req.json();
    } catch (error) {
      console.error('Failed to parse request body:', error);
      throw new Error('Invalid request body format');
    }

    const { payment } = requestData;

    if (!payment) {
      console.error('No payment data provided');
      throw new Error('Payment data is required');
    }

    console.log('Analyzing payment:', payment);

    // Validate required payment fields
    if (!payment.Agreement_Number || !payment.Amount || !payment.Payment_Method) {
      throw new Error('Missing required payment fields');
    }

    // Normalize payment method
    const normalizedPaymentMethod = normalizePaymentMethod(payment.Payment_Method);
    console.log('Normalized payment method:', normalizedPaymentMethod);

    // Validate agreement exists
    const { data: agreement, error: agreementError } = await supabase
      .from('leases')
      .select('id, customer_id')
      .eq('agreement_number', payment.Agreement_Number)
      .single();

    if (agreementError) {
      console.log('Agreement not found:', payment.Agreement_Number);
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

    console.log('Analysis completed successfully:', normalizedPayment);

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
        error: error.message || 'An unexpected error occurred'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
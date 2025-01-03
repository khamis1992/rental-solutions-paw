import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
    const { rawPaymentId } = await req.json();

    // Fetch raw payment data
    const { data: rawPayment, error: fetchError } = await supabase
      .from('raw_payment_imports')
      .select('*')
      .eq('id', rawPaymentId)
      .single();

    if (fetchError) throw fetchError;

    // Process payment with AI insights
    const { error: insertError } = await supabase
      .from('payments')
      .insert({
        lease_id: rawPayment.Agreement_Number,
        amount: Number(rawPayment.Amount),
        payment_method: rawPayment.Payment_Method,
        payment_date: rawPayment.Payment_Date,
        description: rawPayment.Description,
        status: 'completed',
        type: 'Income',
        transaction_id: rawPayment.Transaction_ID
      });

    if (insertError) throw insertError;

    // Update raw payment status
    const { error: updateError } = await supabase
      .from('raw_payment_imports')
      .update({ is_valid: true })
      .eq('id', rawPaymentId);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Payment processed successfully' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing payment:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
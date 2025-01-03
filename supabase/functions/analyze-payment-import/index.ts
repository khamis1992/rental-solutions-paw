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

    // Prepare data for AI analysis
    const prompt = `Analyze this payment data and provide a structured response:
    Agreement Number: ${rawPayment.Agreement_Number}
    Amount: ${rawPayment.Amount}
    Payment Date: ${rawPayment.Payment_Date}
    Description: ${rawPayment.Description}

    Calculate if there are any late fees (120 QAR per day after the 1st of the month).
    Provide the following in your response:
    1. Validated agreement number
    2. Payment amount
    3. Late fee calculation (if applicable)
    4. Total amount including late fees
    5. Payment description
    Format as JSON.`;

    // Get AI analysis
    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a payment processing assistant that analyzes payment data and calculates late fees.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    const aiData = await aiResponse.json();
    const analysis = JSON.parse(aiData.choices[0].message.content);

    // Process payment with AI insights
    const { error: insertError } = await supabase
      .from('payments')
      .insert({
        lease_id: rawPayment.Agreement_Number,
        amount: analysis.paymentAmount,
        amount_paid: analysis.paymentAmount,
        payment_method: rawPayment.Payment_Method,
        payment_date: rawPayment.Payment_Date,
        description: analysis.description,
        status: 'completed',
        type: 'Income',
        late_fine_amount: analysis.lateFeeAmount || 0,
        days_overdue: analysis.daysOverdue || 0
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
        analysis,
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
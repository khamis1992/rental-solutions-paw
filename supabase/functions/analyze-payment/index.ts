import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');
    const { paymentId } = await req.json();
    console.log('Analyzing payment:', paymentId);

    // Fetch payment details
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select(`
        *,
        leases (
          agreement_number,
          total_amount,
          customer_id,
          profiles:customer_id (
            full_name
          )
        )
      `)
      .eq('id', paymentId)
      .single();

    if (paymentError) throw paymentError;

    // Prepare payment data for analysis
    const paymentData = {
      amount: payment.amount,
      payment_method: payment.payment_method,
      payment_date: payment.payment_date,
      lease_total: payment.leases?.total_amount,
      customer_name: payment.leases?.profiles?.full_name,
    };

    // Call Perplexity API for payment analysis
    const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-large-128k-online',
        messages: [{
          role: 'system',
          content: 'You are a payment analysis AI that detects anomalies and validates payment information. Analyze the payment data and provide insights.'
        }, {
          role: 'user',
          content: `Analyze this payment for anomalies and validation: ${JSON.stringify(paymentData)}`
        }]
      })
    });

    if (!perplexityResponse.ok) {
      throw new Error(`Perplexity API error: ${perplexityResponse.statusText}`);
    }

    const aiResponse = await perplexityResponse.json();
    const analysis = aiResponse.choices[0].message.content;

    // Process AI response and extract key information
    const anomalyDetected = analysis.toLowerCase().includes('anomaly') || analysis.toLowerCase().includes('irregular');
    const confidenceScore = analysis.toLowerCase().includes('high confidence') ? 0.9 : 
                           analysis.toLowerCase().includes('medium confidence') ? 0.7 : 0.5;

    // Store analysis results
    const { error: analysisError } = await supabase
      .from('ai_payment_analysis')
      .insert({
        payment_id: paymentId,
        analysis_type: 'validation',
        confidence_score: confidenceScore,
        anomaly_detected: anomalyDetected,
        anomaly_details: anomalyDetected ? [analysis] : [],
        suggested_corrections: {},
        status: anomalyDetected ? 'needs_review' : 'validated'
      });

    if (analysisError) throw analysisError;

    return new Response(
      JSON.stringify({ 
        success: true, 
        analysis: {
          confidence_score: confidenceScore,
          anomaly_detected: anomalyDetected,
          details: analysis
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error analyzing payment:', error);
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
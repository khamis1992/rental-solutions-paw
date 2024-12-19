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

    // Perform AI analysis
    const analysis = {
      anomalies: [],
      confidence_score: 1.0,
      suggested_corrections: {},
    };

    // Check for common anomalies
    if (!payment.amount || payment.amount <= 0) {
      analysis.anomalies.push('Invalid payment amount');
      analysis.confidence_score -= 0.3;
    }

    if (!payment.payment_date) {
      analysis.anomalies.push('Missing payment date');
      analysis.confidence_score -= 0.2;
    }

    if (!payment.payment_method) {
      analysis.anomalies.push('Missing payment method');
      analysis.confidence_score -= 0.2;
    }

    // Store analysis results
    const { error: analysisError } = await supabase
      .from('ai_payment_analysis')
      .insert({
        payment_id: paymentId,
        analysis_type: 'validation',
        confidence_score: analysis.confidence_score,
        anomaly_detected: analysis.anomalies.length > 0,
        anomaly_details: analysis.anomalies,
        suggested_corrections: analysis.suggested_corrections,
      });

    if (analysisError) throw analysisError;

    // Attempt payment reconciliation
    const { error: reconciliationError } = await supabase
      .from('payment_reconciliation')
      .insert({
        payment_id: paymentId,
        lease_id: payment.lease_id,
        reconciliation_status: analysis.anomalies.length > 0 ? 'needs_review' : 'auto_matched',
        match_confidence: analysis.confidence_score,
        discrepancy_details: analysis.anomalies.length > 0 ? analysis.anomalies : null,
        auto_matched: analysis.anomalies.length === 0,
      });

    if (reconciliationError) throw reconciliationError;

    return new Response(
      JSON.stringify({ 
        success: true, 
        analysis,
        message: 'Payment analyzed successfully' 
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
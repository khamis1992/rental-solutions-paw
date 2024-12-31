import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { caseId, caseDetails } = await req.json()

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const supabase = createClient(supabaseUrl!, supabaseKey!)

    // Analyze case factors
    const prediction = analyzeCaseFactors(caseDetails)

    // Store prediction in database
    const { data, error } = await supabase
      .from('case_outcome_predictions')
      .insert([{
        case_id: caseId,
        predicted_outcome: prediction.outcome,
        confidence_score: prediction.confidence,
        predicted_duration: prediction.duration,
        predicted_cost: prediction.cost,
        success_probability: prediction.successProbability,
        risk_factors: prediction.riskFactors,
        similar_cases: prediction.similarCases
      }])
      .select()
      .single()

    if (error) throw error

    return new Response(
      JSON.stringify({ prediction: data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function analyzeCaseFactors(caseDetails: any) {
  // This is a simplified version of case analysis
  // In a production environment, this would use more sophisticated ML models
  const baseSuccessRate = 0.7
  const baseDuration = 30 // days
  const baseCost = 5000

  // Adjust success probability based on case type and amount
  let successProbability = baseSuccessRate
  if (caseDetails.amount_owed > 10000) {
    successProbability *= 0.9
  }
  if (caseDetails.case_type === 'high_priority') {
    successProbability *= 1.1
  }

  // Adjust duration based on case complexity
  let duration = baseDuration
  if (caseDetails.case_type === 'complex') {
    duration *= 1.5
  }

  // Adjust cost based on case factors
  let cost = baseCost
  if (caseDetails.amount_owed > 10000) {
    cost *= 1.2
  }

  return {
    outcome: successProbability > 0.7 ? 'likely_success' : 'needs_attention',
    confidence: 0.85,
    duration: Math.round(duration),
    cost: Math.round(cost),
    successProbability,
    riskFactors: [
      caseDetails.amount_owed > 10000 ? 'high_value_case' : 'standard_value_case',
      caseDetails.case_type === 'complex' ? 'complex_case' : 'standard_case'
    ],
    similarCases: [] // In production, this would be populated with actual similar cases
  }
}
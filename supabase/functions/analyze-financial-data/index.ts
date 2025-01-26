import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    const { type, amount, name, totalFixedCosts, totalVariableCosts } = await req.json()

    // Create scenario analysis
    const scenario = {
      name,
      description: `Analysis of ${type} with investment of ${amount} QAR`,
      assumptions: {
        initial_investment: amount,
        fixed_costs: totalFixedCosts,
        variable_costs: totalVariableCosts,
        time_horizon: '12 months'
      },
      projected_outcomes: {
        revenue_increase: amount * 1.2,
        operational_costs: totalFixedCosts + totalVariableCosts,
        net_profit: (amount * 1.2) - (totalFixedCosts + totalVariableCosts),
        roi_percentage: ((amount * 1.2) - (totalFixedCosts + totalVariableCosts)) / amount * 100
      },
      recommendation: `Based on the analysis, this ${type} scenario shows a potential ROI of ${(((amount * 1.2) - (totalFixedCosts + totalVariableCosts)) / amount * 100).toFixed(1)}%`
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const supabase = createClient(supabaseUrl!, supabaseKey!)

    // Insert into financial_scenarios table
    const { data, error } = await supabase
      .from('financial_scenarios')
      .insert([scenario])
      .select()

    if (error) throw error

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
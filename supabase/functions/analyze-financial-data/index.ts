import { serve } from 'https://deno.fresh.dev/std@v1/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, amount, name, totalFixedCosts, totalVariableCosts } = await req.json();

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
    };

    // Insert into financial_scenarios table
    const { data, error } = await supabase
      .from('financial_scenarios')
      .insert([scenario])
      .select();

    if (error) throw error;

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
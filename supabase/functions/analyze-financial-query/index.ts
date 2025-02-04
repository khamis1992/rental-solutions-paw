import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, context } = await req.json();
    console.log('Processing financial query:', { messageCount: messages.length, context });

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Analyze budget and generate recommendations
    const recommendations = analyzeBudget(context);

    // Store insights in the database
    const { error: insertError } = await supabase
      .from('ai_analytics_insights')
      .insert(recommendations.map(rec => ({
        category: 'budget_optimization',
        insight: rec.title,
        data_points: {
          recommendation: rec.description,
          current_amount: rec.currentAmount,
          recommended_amount: rec.recommendedAmount,
          savings_potential: rec.savingsPotential
        },
        priority: rec.priority,
        confidence_score: 0.85
      })));

    if (insertError) {
      console.error('Error storing insights:', insertError);
    }

    return new Response(
      JSON.stringify({ success: true, recommendations }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in analyze-financial-query:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An error occurred processing your request' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function analyzeBudget(context: any) {
  const recommendations = [];
  const { currentSpending, categories, targetBudget } = context;

  // Calculate total current spending
  const totalCurrentSpending = categories.reduce(
    (sum: number, cat: any) => sum + cat.currentSpending, 
    0
  );

  // If total spending exceeds target budget, generate reduction recommendations
  if (totalCurrentSpending > targetBudget) {
    const reductionNeeded = totalCurrentSpending - targetBudget;
    
    // Analyze each category for potential savings
    categories.forEach((category: any) => {
      const spendingRatio = category.currentSpending / totalCurrentSpending;
      
      if (spendingRatio > 0.3) { // High spending category
        recommendations.push({
          title: `High Spending Alert: ${category.name}`,
          description: `Consider reducing spending in ${category.name} by ${Math.round(spendingRatio * 100)}% to optimize budget allocation.`,
          currentAmount: category.currentSpending,
          recommendedAmount: category.currentSpending * 0.7,
          savingsPotential: category.currentSpending * 0.3,
          priority: 1
        });
      }
    });
  }

  // Add general optimization recommendations
  recommendations.push({
    title: "Budget Allocation Strategy",
    description: `Based on current spending patterns, consider reallocating resources to maintain a balanced budget of ${targetBudget} QAR.`,
    currentAmount: totalCurrentSpending,
    recommendedAmount: targetBudget,
    savingsPotential: Math.max(0, totalCurrentSpending - targetBudget),
    priority: 2
  });

  return recommendations;
}
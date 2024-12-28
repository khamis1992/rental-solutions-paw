import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { type, amount, name, totalFixedCosts, totalVariableCosts } = await req.json()
    const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY')

    if (!perplexityApiKey) {
      throw new Error('Perplexity API key not configured')
    }

    console.log('Analyzing financial data:', { type, amount, name })

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-large-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are a financial analyst AI. Analyze expense patterns and provide insights on financial health and recommendations.'
          },
          {
            role: 'user',
            content: `Analyze this new ${type} cost: Name: ${name}, Amount: ${amount}. 
                     Current total fixed costs: ${totalFixedCosts}, total variable costs: ${totalVariableCosts}.
                     Consider the following in your analysis:
                     1. Impact on overall financial health
                     2. Cost optimization opportunities
                     3. Comparison with industry standards
                     4. Future implications and trends
                     Provide specific, actionable insights and recommendations.`
          }
        ],
        temperature: 0.2,
        max_tokens: 1000,
      }),
    })

    const analysis = await response.json()
    
    // Process the AI response and format it for the application
    const insight = {
      message: analysis.choices[0].message.content,
      priority: determinePriority(amount, totalFixedCosts, totalVariableCosts),
    }

    return new Response(
      JSON.stringify(insight),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 },
    )
  }
})

function determinePriority(amount: number, totalFixedCosts: number, totalVariableCosts: number): number {
  const totalCosts = totalFixedCosts + totalVariableCosts
  const impactPercentage = (amount / totalCosts) * 100
  
  if (impactPercentage > 20) return 1 // High priority
  if (impactPercentage > 10) return 2 // Medium priority
  return 3 // Low priority
}
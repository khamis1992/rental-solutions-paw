import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { scenario } = await req.json()
    console.log('Analyzing scenario:', scenario)

    const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY')
    if (!deepseekApiKey) {
      throw new Error('DeepSeek API key not configured')
    }

    // Call DeepSeek API for analysis
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${deepseekApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are a financial analyst specializing in vehicle rental business analysis. Analyze the scenario and provide insights focusing on ROI, profitability, and risk factors.'
          },
          {
            role: 'user',
            content: `Analyze this scenario for a vehicle rental business: ${JSON.stringify(scenario)}`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      }),
    })

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status}`)
    }

    const analysis = await response.json()
    
    // Create analytics insight
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const supabase = createClient(supabaseUrl!, supabaseKey!)

    const { data, error } = await supabase
      .from('analytics_insights')
      .insert([{
        category: 'scenario_analysis',
        insight: analysis.choices[0].message.content,
        data_points: {
          scenario: scenario,
          roi_percentage: scenario.roi,
          net_profit: scenario.profit,
          analysis_date: new Date().toISOString()
        },
        confidence_score: 0.85
      }])
      .select()

    if (error) throw error

    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
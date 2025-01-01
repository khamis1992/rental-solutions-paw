import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY')

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { errors } = await req.json()
    
    // Prepare context for Deepseek AI
    const prompt = `
    Analyze these import errors and provide user-friendly suggestions for fixing them:
    ${JSON.stringify(errors, null, 2)}
    
    For each error:
    1. Explain what went wrong in simple terms
    2. Provide step-by-step instructions to fix it
    3. Give an example of the correct format if applicable
    
    Format the response as JSON with:
    - explanation (string)
    - steps (array of strings)
    - example (string, optional)
    `

    const aiResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: 'You are a data validation assistant specializing in CSV imports.' },
          { role: 'user', content: prompt }
        ]
      })
    })

    if (!aiResponse.ok) {
      throw new Error(`Deepseek API error: ${await aiResponse.text()}`)
    }

    const analysis = await aiResponse.json()
    
    return new Response(
      JSON.stringify({
        success: true,
        analysis: analysis.choices[0].message.content
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error analyzing import errors:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
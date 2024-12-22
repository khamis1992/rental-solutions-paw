import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Verify origin
    const origin = req.headers.get('origin')
    if (!origin) {
      throw new Error('Origin header is required')
    }

    // Get request data
    const { messages, dbResponse } = await req.json()

    // Call Perplexity API
    const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('PERPLEXITY_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-large-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful rental solutions assistant. Provide clear and concise responses.'
          },
          ...messages
        ],
        temperature: 0.2,
        max_tokens: 1000,
      }),
    })

    if (!perplexityResponse.ok) {
      console.error('Perplexity API error:', await perplexityResponse.text())
      throw new Error('Failed to get response from AI service')
    }

    const data = await perplexityResponse.json()
    
    return new Response(
      JSON.stringify({ 
        message: data.choices[0].message.content,
        origin: origin // Include origin in response for debugging
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
          // Only allow the specific origin that made the request
          'Access-Control-Allow-Origin': origin
        } 
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
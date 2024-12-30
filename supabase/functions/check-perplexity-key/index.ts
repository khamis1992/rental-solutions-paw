import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    })
  }

  try {
    // Validate request method
    if (req.method !== 'POST') {
      throw new Error('Method not allowed')
    }

    const perplexityKey = Deno.env.get('PERPLEXITY_API_KEY')
    if (!perplexityKey) {
      console.error('PERPLEXITY_API_KEY not found in environment variables')
      throw new Error('API key not configured')
    }

    console.log('Testing Perplexity API connection...')

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'Hello!' }
        ],
        temperature: 0.7,
        max_tokens: 100
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Perplexity API error:', errorData)
      throw new Error(`API key validation failed: ${JSON.stringify(errorData)}`)
    }

    const data = await response.json()
    console.log('Perplexity API test successful')

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'API key validated successfully',
        data 
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error in check-perplexity-key function:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'An unexpected error occurred'
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
})
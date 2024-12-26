import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const apiKey = Deno.env.get('PERPLEXITY_API_KEY')
    
    if (!apiKey) {
      console.error('Perplexity API key not configured')
      throw new Error('API key not configured')
    }

    console.log('Testing Perplexity API key...')

    // Test the API key with a simple request
    const testResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'sonar-small-chat',
        messages: [{ role: 'system', content: 'Test message' }]
      })
    })

    const responseText = await testResponse.text()
    console.log('Perplexity API response:', responseText)

    if (!testResponse.ok) {
      console.error('Perplexity API test failed:', responseText)
      throw new Error(`API key validation failed: ${responseText}`)
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'API key is valid and working'
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (error) {
    console.error('Error checking API key:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 500
      }
    )
  }
})
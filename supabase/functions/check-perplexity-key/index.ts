import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders, handleCorsPreflightRequest, isValidOrigin } from '../_shared/cors.ts'

serve(async (req) => {
  // Handle CORS preflight request
  const preflightResponse = handleCorsPreflightRequest(req);
  if (preflightResponse) return preflightResponse;

  // Validate origin
  const origin = req.headers.get('origin');
  if (!isValidOrigin(origin)) {
    return new Response(
      JSON.stringify({ error: 'Invalid origin' }), 
      { 
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    const apiKey = Deno.env.get('PERPLEXITY_API_KEY')
    const isConfigured = !!apiKey

    return new Response(
      JSON.stringify({ isConfigured }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    console.log('Processing chat request:', { messageCount: messages.length });

    const response = await fetch('https://api.perplexity.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `You are a helpful assistant for a vehicle rental company. Only provide information based on the system data. 
            
Available commands:
- Extend rental: "extend rental for Vehicle [LICENSE_PLATE] by [NUMBER] days"
- Dispute fine: "dispute fine #[FINE_NUMBER] because [REASON]"

For rental extensions:
1. Verify the vehicle exists and has an active rental
2. Confirm the extension period is reasonable (1-30 days)
3. Process the extension and confirm the new end date

For fine disputes:
1. Verify the fine exists in the system
2. Create a legal case with the provided reason
3. Provide the case reference number for tracking

Always verify numbers and statistics before responding. If a command is not properly formatted, explain the correct format.`
          },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get AI response');
    }

    const data = await response.json();
    console.log('DeepSeek API response:', data);

    return new Response(
      JSON.stringify({ message: data.choices[0].message.content }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in chat function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
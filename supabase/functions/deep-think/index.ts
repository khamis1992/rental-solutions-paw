import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    console.log('Processing deep think request:', { messageCount: messages.length, hasContext: !!context });

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');

    if (!deepseekApiKey) {
      throw new Error('DeepSeek API key not configured');
    }

    // Get the user's message
    const userMessage = messages[messages.length - 1].content;
    const detectedLanguage = userMessage.match(/[\u0600-\u06FF]/) ? 'ar' : 'en';

    // Create system message based on language
    const systemMessage = {
      role: 'system',
      content: detectedLanguage === 'ar' 
        ? 'أنت مساعد تحليلي يساعد في حل المشكلات من خلال طرح أسئلة توضيحية وتقديم حلول متعددة مع تحليل المزايا والعيوب.'
        : 'You are an analytical assistant that helps solve problems by asking clarifying questions and providing multiple solutions with pros and cons analysis.'
    };

    // Add context-specific instructions
    const contextMessage = {
      role: 'system',
      content: `Focus on ${context || 'general rental business'} related issues. Always structure your response in three parts:
1. Clarifying Questions: Ask 2-3 key questions to better understand the situation
2. Solution Analysis: Present 2-3 possible solutions with pros and cons
3. Next Steps: Provide clear, actionable steps for implementation`
    };

    console.log('Calling DeepSeek API...');
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${deepseekApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          systemMessage,
          contextMessage,
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 1000
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API error response:', errorText);
      throw new Error(`DeepSeek API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('DeepSeek API response received');

    if (!data.choices?.[0]?.message) {
      throw new Error('Invalid response format from DeepSeek API');
    }

    // Log the interaction for analysis
    const { error: logError } = await supabase
      .from('ai_query_history')
      .insert({
        query: userMessage,
        detected_language: detectedLanguage,
        detected_intent: 'deep_think',
        response_data: data.choices[0].message,
        success_rate: 1.0
      });

    if (logError) {
      console.error('Error logging query:', logError);
    }

    return new Response(
      JSON.stringify({ message: data.choices[0].message.content }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in deep-think function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An error occurred processing your request',
        language: error.message?.match(/[\u0600-\u06FF]/) ? 'ar' : 'en'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
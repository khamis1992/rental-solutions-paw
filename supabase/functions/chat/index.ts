import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const detectLanguage = (text: string): 'en' | 'ar' => {
  const arabicPattern = /[\u0600-\u06FF]/;
  return arabicPattern.test(text) ? 'ar' : 'en';
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, dbResponse } = await req.json();
    console.log('Processing chat request:', { messageCount: messages.length, hasDbResponse: !!dbResponse });

    // If we have a database response, use it directly
    if (dbResponse) {
      console.log('Using database response:', dbResponse);
      return new Response(
        JSON.stringify({ message: dbResponse }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      throw new Error('Invalid or empty messages array');
    }

    const userMessage = messages[messages.length - 1].content;
    if (!userMessage) {
      throw new Error('Invalid user message');
    }

    const detectedLanguage = detectLanguage(userMessage);

    // Get system context from database
    const { data: systemContext } = await supabase
      .from('help_guides')
      .select('*')
      .limit(5);

    // Enhanced system prompt with strict data boundaries
    const systemMessage = {
      role: 'system',
      content: detectedLanguage === 'ar' 
        ? `أنت مساعد مفيد لشركة تأجير السيارات. يجب عليك:
           1. تقديم المعلومات فقط بناءً على بيانات النظام الداخلية
           2. عدم استخدام أي معلومات خارجية
           3. الإشارة بوضوح عندما لا تتوفر المعلومات المطلوبة
           4. طلب توضيح عند الحاجة لمزيد من المعلومات`
        : `You are a helpful vehicle rental company assistant. You must:
           1. Provide information ONLY based on internal system data
           2. Never use external information
           3. Clearly indicate when requested information is not available
           4. Ask for clarification when more context is needed
           
           Available data categories: vehicles, customers, agreements, payments, maintenance.
           Current system context: ${JSON.stringify(systemContext)}`
    };

    const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
    if (!deepseekApiKey) {
      throw new Error('DeepSeek API key not configured');
    }

    // Log the query for analysis
    const { error: logError } = await supabase.from('ai_query_history').insert({
      query: userMessage,
      detected_language: detectedLanguage,
      detected_intent: 'general_query',
      response_data: {},
      success_rate: 1.0
    });

    if (logError) {
      console.error('Error logging query:', logError);
    }

    // Enhanced DeepSeek API call with better context management
    console.log('Calling DeepSeek API with enhanced context...');
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
          // Include recent context from query history
          ...(await getRecentQueryContext(supabase)),
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 1000,
        // Add parameters for enhanced response accuracy
        top_p: 0.95,
        frequency_penalty: 0.5,
        presence_penalty: 0.5
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

    // Validate response against internal data
    const validatedResponse = await validateResponseAgainstInternalData(
      data.choices[0].message.content,
      supabase
    );

    // Update query history with the response
    const { error: updateError } = await supabase
      .from('ai_query_history')
      .update({
        response_data: validatedResponse,
        success_rate: 1.0
      })
      .eq('query', userMessage);

    if (updateError) {
      console.error('Error updating query history:', updateError);
    }

    return new Response(
      JSON.stringify({ message: validatedResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in chat function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An error occurred processing your request',
        language: detectLanguage(error.message)
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

// Helper function to get recent query context
async function getRecentQueryContext(supabase: any) {
  const { data: recentQueries } = await supabase
    .from('ai_query_history')
    .select('query, response_data')
    .order('created_at', { ascending: false })
    .limit(3);

  return recentQueries?.map((q: any) => ({
    role: 'system',
    content: `Recent interaction - Query: ${q.query}, Response: ${JSON.stringify(q.response_data)}`
  })) || [];
}

// Helper function to validate response against internal data
async function validateResponseAgainstInternalData(response: string, supabase: any): Promise<string> {
  // Check if response references any external data
  if (response.includes('external') || response.includes('internet') || response.includes('online')) {
    return 'I can only provide information based on our internal system data. Please rephrase your question to focus on available information about vehicles, customers, agreements, payments, or maintenance.';
  }

  // Ensure response aligns with available data
  const { data: availableData } = await supabase
    .from('help_guides')
    .select('title, steps')
    .limit(1);

  if (!availableData?.length && response.length > 100) {
    return 'I need to limit my response to information available in our system. Could you please ask about specific aspects of our vehicles, customers, agreements, payments, or maintenance?';
  }

  return response;
}
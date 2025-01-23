import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const detectLanguage = (text: string): 'en' | 'ar' => {
  // Simple Arabic character detection
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

    const userMessage = messages[messages.length - 1].content;
    const detectedLanguage = detectLanguage(userMessage);

    // Get matching query patterns
    const { data: patterns } = await supabase
      .from('ai_query_patterns')
      .select('*')
      .eq('language', detectedLanguage);

    // Log the query for analysis
    await supabase.from('ai_query_history').insert({
      query: userMessage,
      detected_language: detectedLanguage,
      detected_intent: 'general_query',
      response_data: {},
      success_rate: 1.0
    });

    const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
    if (!deepseekApiKey) {
      throw new Error('DeepSeek API key not configured');
    }

    // Prepare system message based on language
    const systemMessage = {
      role: 'system',
      content: detectedLanguage === 'ar' 
        ? 'أنت مساعد مفيد لشركة تأجير السيارات. قدم المعلومات فقط بناءً على بيانات النظام. إذا لم تتمكن من العثور على بيانات محددة، اطلب من المستخدم إعادة صياغة سؤاله ليتطابق مع فئات المعلومات المتاحة: المركبات، العملاء، الاتفاقيات، المدفوعات، أو الصيانة.'
        : 'You are a helpful assistant for a vehicle rental company. Only provide information based on the system data. If you cannot find specific data, ask the user to rephrase their question to match available information categories: vehicles, customers, agreements, payments, or maintenance.'
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

    // Update query history with the response
    await supabase
      .from('ai_query_history')
      .update({
        response_data: data.choices[0].message,
        success_rate: 1.0
      })
      .eq('query', userMessage);

    return new Response(
      JSON.stringify({ message: data.choices[0].message.content }),
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
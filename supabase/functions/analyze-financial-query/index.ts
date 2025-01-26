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
    const { messages, dbResponse } = await req.json();
    console.log('Processing financial query:', { messageCount: messages.length, hasDbResponse: !!dbResponse });

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

    // Get financial context from database
    const { data: financialContext } = await supabase
      .from('ai_analytics_insights')
      .select('*')
      .limit(5);

    const systemMessage = {
      role: 'system',
      content: `You are a Virtual CFO assistant. You must:
        1. Only provide information based on internal financial data
        2. Never use external information
        3. Clearly indicate when requested information is not available
        4. Ask for clarification when more context is needed
        
        Available data categories: revenue, expenses, budgets, cash flow, profitability.
        Current financial context: ${JSON.stringify(financialContext)}`
    };

    const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
    if (!deepseekApiKey) {
      throw new Error('DeepSeek API key not configured');
    }

    // Log the query for analysis
    const { error: logError } = await supabase.from('ai_query_history').insert({
      query: messages[messages.length - 1].content,
      detected_language: 'en',
      detected_intent: 'financial_query',
      response_data: {},
      success_rate: 1.0
    });

    if (logError) {
      console.error('Error logging query:', logError);
    }

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
        max_tokens: 1000,
        top_p: 0.95,
        frequency_penalty: 0.5,
        presence_penalty: 0.5
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API error:', errorText);
      throw new Error(`DeepSeek API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('DeepSeek API response received');

    // Update query history with the response
    const { error: updateError } = await supabase
      .from('ai_query_history')
      .update({
        response_data: data.choices[0].message,
        success_rate: 1.0
      })
      .eq('query', messages[messages.length - 1].content);

    if (updateError) {
      console.error('Error updating query history:', updateError);
    }

    return new Response(
      JSON.stringify({ message: data.choices[0].message.content }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in analyze-financial-query:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An error occurred processing your request' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
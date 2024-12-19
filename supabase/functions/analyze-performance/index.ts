import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch recent performance metrics
    const { data: metrics, error: metricsError } = await supabaseClient
      .from('performance_metrics')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(100);

    if (metricsError) {
      throw new Error(`Failed to fetch metrics: ${metricsError.message}`);
    }

    console.log('Fetched metrics:', metrics);

    // Analyze metrics using Perplexity API
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('PERPLEXITY_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are a performance analysis expert. Analyze the system metrics and provide 3 actionable insights with specific recommendations. Format each insight as a separate object with category, insight, recommendation, and priority (1 for high, 2 for normal).'
          },
          {
            role: 'user',
            content: `Analyze these system metrics and provide 3 key insights: ${JSON.stringify(metrics)}`
          }
        ],
        temperature: 0.2,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.statusText}`);
    }

    const analysis = await response.json();
    console.log('AI Analysis response:', analysis);

    // Parse the AI response and extract insights
    const aiMessage = analysis.choices[0].message.content;
    console.log('AI Message:', aiMessage);

    // Parse the message into structured insights
    const insights = aiMessage.split('\n\n').slice(0, 3).map((insight, index) => ({
      category: `Performance Insight ${index + 1}`,
      insight: insight.split('\nRecommendation:')[0].trim(),
      recommendation: insight.split('\nRecommendation:')[1]?.trim() || 'No specific recommendation provided',
      priority: insight.toLowerCase().includes('critical') || insight.toLowerCase().includes('high') ? 1 : 2,
      status: 'pending'
    }));

    console.log('Structured insights:', insights);

    // Store AI insights
    const { error: insertError } = await supabaseClient
      .from('ai_insights')
      .insert(insights);

    if (insertError) {
      throw new Error(`Failed to store insights: ${insertError.message}`);
    }

    return new Response(
      JSON.stringify({ success: true, insights }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in analyze-performance:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
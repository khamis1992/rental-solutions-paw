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
    const { data: metrics } = await supabaseClient
      .from('performance_metrics')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(100);

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
            content: 'You are a performance analysis expert. Analyze the system metrics and provide actionable insights and recommendations.'
          },
          {
            role: 'user',
            content: `Analyze these system metrics and provide 3 key insights with recommendations: ${JSON.stringify(metrics)}`
          }
        ],
        temperature: 0.2,
        max_tokens: 1000,
      }),
    });

    const analysis = await response.json();
    const insights = analysis.choices[0].message.content;

    // Store AI insights
    await supabaseClient
      .from('ai_insights')
      .insert({
        category: 'performance',
        insight: insights,
        recommendation: insights,
        priority: 1,
        status: 'pending'
      });

    return new Response(
      JSON.stringify({ success: true, insights }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
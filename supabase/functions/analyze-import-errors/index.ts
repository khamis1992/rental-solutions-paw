import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { errors } = await req.json();

    if (!errors || !Array.isArray(errors)) {
      throw new Error('Invalid input: errors must be an array');
    }

    // Format errors for analysis
    const errorContext = errors.map((error, index) => 
      `Error ${index + 1}: ${error.message || error.error || JSON.stringify(error)}`
    ).join('\n');

    // Call Deepseek API for analysis
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
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
            content: 'You are an AI assistant that analyzes import errors and provides user-friendly suggestions for fixing them.'
          },
          {
            role: 'user',
            content: `Please analyze these import errors and provide specific suggestions for fixing each one:\n\n${errorContext}`
          }
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Deepseek API error: ${await response.text()}`);
    }

    const aiResult = await response.json();
    const analysis = aiResult.choices[0].message.content;

    // Extract suggestions from analysis
    const suggestions = analysis.split('\n')
      .filter(line => line.trim().startsWith('-') || line.trim().startsWith('*'))
      .map(line => line.trim().replace(/^[-*]\s+/, ''));

    return new Response(
      JSON.stringify({
        success: true,
        analysis,
        suggestions,
        errorCount: errors.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error analyzing import errors:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
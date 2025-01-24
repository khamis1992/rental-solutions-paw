import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from '@supabase/supabase-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();

    // Simple sentiment analysis logic
    const words = text.toLowerCase().split(' ');
    
    // Define sentiment dictionaries
    const positiveWords = ['good', 'great', 'excellent', 'happy', 'pleased', 'thank', 'thanks', 'helpful'];
    const negativeWords = ['bad', 'poor', 'terrible', 'unhappy', 'disappointed', 'issue', 'problem', 'wrong'];
    const urgentWords = ['urgent', 'asap', 'emergency', 'immediately', 'critical', 'urgent', '!!!!', '???'];

    // Calculate scores
    let sentimentScore = 0;
    let urgencyScore = 0;

    words.forEach(word => {
      if (positiveWords.includes(word)) sentimentScore++;
      if (negativeWords.includes(word)) sentimentScore--;
      if (urgentWords.includes(word)) urgencyScore++;
    });

    // Normalize scores
    const normalizedScore = sentimentScore / words.length;
    
    // Determine sentiment label and urgency
    const sentimentLabel = normalizedScore > 0 ? 'positive' : 
                          normalizedScore < 0 ? 'negative' : 'neutral';
    
    const urgencyLevel = urgencyScore > 0 ? 'high' : 
                        words.length > 20 ? 'medium' : 'low';

    return new Response(
      JSON.stringify({
        score: normalizedScore,
        label: sentimentLabel,
        urgency: urgencyLevel
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    );
  } catch (error) {
    console.error('Error in sentiment analysis:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});
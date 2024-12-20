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
    const { fineId } = await req.json();
    const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY')!;

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch fine details
    const { data: fine } = await supabase
      .from('traffic_fines')
      .select('*')
      .eq('id', fineId)
      .single();

    if (!fine) {
      throw new Error('Fine not found');
    }

    // Fetch potential agreements that overlap with the fine date
    const { data: agreements } = await supabase
      .from('leases')
      .select(`
        id,
        start_date,
        end_date,
        customer:profiles(full_name),
        vehicle:vehicles(
          make,
          model,
          license_plate
        )
      `)
      .lte('start_date', fine.fine_date)
      .gte('end_date', fine.fine_date)
      .eq('status', 'active');

    if (!agreements?.length) {
      return new Response(
        JSON.stringify({ 
          message: 'No matching agreements found for the fine date',
          suggestions: [] 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use Perplexity to analyze and suggest the best match
    const prompt = `
      I have a traffic fine with the following details:
      - Date: ${new Date(fine.fine_date).toLocaleDateString()}
      - Location: ${fine.fine_location || 'Unknown'}
      - Type: ${fine.fine_type}
      - Amount: ${fine.fine_amount}

      And these potential matching agreements:
      ${agreements.map((agreement, index) => `
      ${index + 1}. Agreement for ${agreement.customer.full_name}
         - Vehicle: ${agreement.vehicle.make} ${agreement.vehicle.model} (${agreement.vehicle.license_plate})
         - Period: ${new Date(agreement.start_date).toLocaleDateString()} to ${new Date(agreement.end_date).toLocaleDateString()}
      `).join('\n')}

      Based on the dates and details, which agreement is most likely associated with this fine? 
      Return a JSON object with:
      1. The index of the most likely agreement (1-based)
      2. A confidence score between 0 and 1
      3. A brief explanation of why this match was chosen
    `;

    const aiResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that analyzes traffic fines and rental agreements to find the best matches. Always return valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 1000,
      }),
    });

    const aiData = await aiResponse.json();
    const analysis = JSON.parse(aiData.choices[0].message.content);

    // Prepare suggestions with AI analysis
    const suggestions = agreements.map((agreement, index) => ({
      agreement,
      isRecommended: index + 1 === analysis.index,
      confidence: analysis.index === index + 1 ? analysis.confidence : 0,
      explanation: analysis.index === index + 1 ? analysis.explanation : null
    }));

    return new Response(
      JSON.stringify({ 
        message: 'AI analysis completed',
        suggestions 
      }),
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
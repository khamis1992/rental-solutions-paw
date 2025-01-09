import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Configuration, OpenAIApi } from "https://esm.sh/openai@3.2.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { remainingAmount, agreement, mapping } = await req.json();

    // Initialize OpenAI
    const configuration = new Configuration({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    });
    const openai = new OpenAIApi(configuration);

    // Prepare the prompt for OpenAI
    const prompt = `
      Analyze and validate the mapping between remaining amounts data and agreement details:
      
      Remaining Amounts Data:
      ${JSON.stringify(remainingAmount, null, 2)}
      
      Agreement Data:
      ${JSON.stringify(agreement, null, 2)}
      
      Mapping Rules:
      ${JSON.stringify(mapping, null, 2)}
      
      Verify if:
      1. The agreement_duration maps correctly to Agreement Duration
      2. The final_price maps correctly to Contract Value/Total Amount
      3. The rent_amount maps correctly to Monthly Rent Amount
      4. The remaining_amount maps correctly to Remaining Balance
      
      Return only a JSON object with:
      {
        "isValid": boolean,
        "message": "explanation if invalid",
        "correctedValues": {mapped values if corrections needed}
      }
    `;

    console.log('Sending prompt to OpenAI:', prompt);

    const completion = await openai.createCompletion({
      model: 'gpt-4o-mini',
      prompt,
      max_tokens: 500,
      temperature: 0.1,
    });

    console.log('OpenAI response:', completion.data);

    const aiResponse = completion.data.choices[0].text?.trim();
    let result;
    
    try {
      result = JSON.parse(aiResponse || '{"isValid": true}');
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      result = {
        isValid: false,
        message: "Error parsing AI response",
        correctedValues: null
      };
    }

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  } catch (error) {
    console.error('Error in validate-agreement-mapping:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        isValid: false,
        message: "Error processing validation request",
        correctedValues: null
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }
});
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
    console.log('Received request data:', { remainingAmount, agreement, mapping });

    if (!remainingAmount || !agreement) {
      throw new Error('Missing required data');
    }

    const openAiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const openai = new OpenAIApi(new Configuration({ apiKey: openAiKey }));

    const prompt = `
      You are a data mapping validator. Your task is to validate the following data mappings:

      Remaining Amounts Data:
      ${JSON.stringify(remainingAmount, null, 2)}
      
      Agreement Data:
      ${JSON.stringify(agreement, null, 2)}
      
      Validate these specific mappings:
      1. Agreement Duration: ${remainingAmount.agreement_duration} -> ${agreement.agreement_duration}
      2. Final Price/Total Amount: ${remainingAmount.final_price} -> ${agreement.total_amount}
      3. Rent Amount: ${remainingAmount.rent_amount} -> ${agreement.rent_amount}
      4. Remaining Amount: ${remainingAmount.remaining_amount}

      Validation Rules:
      1. Duration must be a valid interval (e.g., "12 months", "24 months", "3 years")
      2. All amounts must be positive numbers
      3. Remaining amount cannot exceed final price
      4. All fields must be present and valid

      Return only a JSON object in this exact format:
      {
        "isValid": true/false,
        "message": "explanation of validation result",
        "correctedValues": {
          "agreement_duration": "validated duration",
          "total_amount": number,
          "rent_amount": number,
          "remaining_amount": number
        }
      }`;

    console.log('Sending prompt to OpenAI:', prompt);
    
    const completion = await openai.createCompletion({
      model: "gpt-4o-mini",
      prompt,
      max_tokens: 500,
      temperature: 0.1,
    });

    if (!completion.data?.choices?.[0]?.text) {
      throw new Error('Invalid response from OpenAI');
    }

    const aiResponse = completion.data.choices[0].text.trim();
    console.log('Received AI response:', aiResponse);

    let result;
    try {
      result = JSON.parse(aiResponse);
      
      // Additional validation of AI response
      if (result.isValid && result.correctedValues) {
        const { agreement_duration, total_amount, rent_amount, remaining_amount } = result.correctedValues;
        
        // Validate duration format
        if (!agreement_duration?.includes('month') && !agreement_duration?.includes('year')) {
          result.isValid = false;
          result.message = "Invalid duration format";
        }
        
        // Validate amounts
        if (isNaN(total_amount) || total_amount <= 0) {
          result.isValid = false;
          result.message = "Invalid total amount";
        }
        
        if (isNaN(rent_amount) || rent_amount <= 0) {
          result.isValid = false;
          result.message = "Invalid rent amount";
        }
        
        if (isNaN(remaining_amount) || remaining_amount < 0) {
          result.isValid = false;
          result.message = "Invalid remaining amount";
        }
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      result = {
        isValid: false,
        message: "Error parsing AI response",
        correctedValues: null
      };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in validate-agreement-mapping function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        isValid: false,
        message: "Error processing validation request",
        correctedValues: null
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
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

    if (!remainingAmount || !agreement) {
      throw new Error('Missing required data');
    }

    // Initialize OpenAI with error handling
    const configuration = new Configuration({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    });

    if (!configuration.apiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    const openai = new OpenAIApi(configuration);

    // Prepare the prompt with specific mapping instructions
    const prompt = `
      You are a data mapping validator. Analyze the following data and ensure correct field mapping:

      Remaining Amounts Data:
      ${JSON.stringify(remainingAmount, null, 2)}
      
      Agreement Data:
      ${JSON.stringify(agreement, null, 2)}
      
      Required Field Mappings:
      1. Map "Agreement Duration" from remaining_amounts.agreement_duration to agreement.duration
      2. Map "Final Price" from remaining_amounts.final_price to agreement.total_amount
      3. Map "Rent Amount" from remaining_amounts.rent_amount to agreement.rent_amount
      4. Map "Remaining Amount" from remaining_amounts.remaining_amount to agreement.remaining_amount

      Validation Rules:
      1. Agreement Duration must be a valid interval (e.g., "12 months", "24 months")
      2. All amounts must be positive numbers
      3. Remaining Amount must not exceed Final Price
      4. All fields must be present and valid

      Return a JSON object with:
      {
        "isValid": boolean,
        "message": "detailed explanation",
        "correctedValues": {
          "agreement_duration": "mapped duration value",
          "total_amount": "mapped final price value",
          "rent_amount": "mapped rent amount value",
          "remaining_amount": "mapped remaining amount value"
        }
      }
    `;

    console.log('Starting validation with data:', {
      remainingAmount,
      agreement
    });

    const completion = await openai.createCompletion({
      model: 'gpt-4o-mini',
      prompt,
      max_tokens: 500,
      temperature: 0.1,
    });

    if (!completion.data || !completion.data.choices || !completion.data.choices[0]) {
      throw new Error('Invalid response from OpenAI');
    }

    const aiResponse = completion.data.choices[0].text?.trim();
    let result;
    
    try {
      result = JSON.parse(aiResponse || '{"isValid": false, "message": "No response from AI"}');
      
      // Additional validation of AI response
      if (result.isValid && result.correctedValues) {
        const { agreement_duration, total_amount, rent_amount, remaining_amount } = result.correctedValues;
        
        // Validate duration format
        if (!agreement_duration?.includes('month')) {
          result.isValid = false;
          result.message = "Invalid duration format";
        }
        
        // Validate amounts
        if (isNaN(total_amount) || total_amount <= 0) {
          result.isValid = false;
          result.message = "Invalid contract value";
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
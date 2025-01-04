import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Parse and validate request body
    const body = await req.json().catch(() => null);
    if (!body) {
      throw new Error('Missing request body');
    }

    const { firstChequeNumber, amount, firstPaymentDate, totalInstallments } = body;

    // Validate required fields
    if (!firstChequeNumber || !amount || !firstPaymentDate || !totalInstallments) {
      throw new Error('Missing required fields');
    }

    console.log('Analyzing payment details:', { firstChequeNumber, amount, firstPaymentDate, totalInstallments });

    // Analyze cheque number pattern
    const hasValidFormat = /^[A-Za-z]*\d+$/.test(firstChequeNumber);
    const chequeLength = firstChequeNumber.length;
    
    // Analyze payment amount
    const isRoundAmount = amount % 1 === 0;
    const isLargeAmount = amount > 10000;
    
    // Analyze payment schedule
    const paymentDate = new Date(firstPaymentDate);
    const isWeekend = paymentDate.getDay() === 0 || paymentDate.getDay() === 6;
    const totalValue = amount * totalInstallments;

    // Risk assessment
    const riskFactors = [];
    if (!hasValidFormat) riskFactors.push("Cheque number format may not follow standard patterns");
    if (isWeekend) riskFactors.push("First payment date falls on a weekend");
    if (isLargeAmount) riskFactors.push("Individual installment amount is significantly high");

    // Generate recommendations
    const recommendations = [];
    if (!hasValidFormat) {
      recommendations.push("Consider using a standardized cheque number format");
    }
    if (isWeekend) {
      recommendations.push("Consider adjusting payment date to avoid weekends");
    }
    if (!isRoundAmount) {
      recommendations.push("Consider rounding the amount for easier processing");
    }

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (riskFactors.length >= 3) {
      riskLevel = 'high';
    } else if (riskFactors.length >= 1) {
      riskLevel = 'medium';
    }

    // Add default recommendations if none were generated
    if (recommendations.length === 0) {
      recommendations.push("Payment schedule appears optimal");
      recommendations.push(`Total contract value will be QAR ${totalValue}`);
    }

    const response = {
      riskAssessment: {
        riskLevel,
        factors: riskFactors.length > 0 ? riskFactors : ["No significant risk factors identified"],
      },
      recommendations: recommendations,
      suggestedDates: [firstPaymentDate],
    };

    console.log('Analysis response:', response);

    return new Response(
      JSON.stringify(response),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error in analyze-payment-installment:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        details: error.toString()
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 400
      }
    );
  }
});
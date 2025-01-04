import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { firstChequeNumber, amount, firstPaymentDate, totalInstallments } = await req.json();

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
      suggestedDates: [firstPaymentDate], // Could be expanded to suggest alternative dates
    };

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 },
    );
  }
});
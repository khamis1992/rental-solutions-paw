import { supabase } from "@/integrations/supabase/client";

interface AIPaymentSuggestion {
  suggestedDates: string[];
  riskAssessment: {
    riskLevel: 'low' | 'medium' | 'high';
    factors: string[];
  };
  recommendations: string[];
}

export const getAIPaymentSuggestions = async (
  firstChequeNumber: string,
  amount: number,
  firstPaymentDate: string,
  totalInstallments: number
): Promise<AIPaymentSuggestion> => {
  try {
    const { data, error } = await supabase.functions.invoke("analyze-payment-installment", {
      body: {
        firstChequeNumber,
        amount,
        firstPaymentDate,
        totalInstallments
      }
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting AI suggestions:', error);
    throw error;
  }
};
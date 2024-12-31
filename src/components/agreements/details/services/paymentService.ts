import { supabase } from "@/integrations/supabase/client";
import { PaymentMethodType, PaymentStatus } from "@/types/database/agreement.types";

interface PaymentData {
  lease_id: string;
  amount: number;
  payment_method: PaymentMethodType;
  payment_date: string;
  status: PaymentStatus;
  is_recurring: boolean;
  recurring_interval?: string | null;
  next_payment_date?: string | null;
  description?: string;
}

export const submitPayment = async (paymentData: PaymentData) => {
  try {
    console.log('Submitting payment with data:', paymentData);
    
    const { data, error } = await supabase.functions
      .invoke('process-payment-import', {
        body: paymentData
      });

    if (error) {
      console.error('Payment submission error:', error);
      throw error;
    }

    console.log('Payment submission response:', data);
    return data;
  } catch (error) {
    console.error('Error in submitPayment:', error);
    throw error;
  }
};
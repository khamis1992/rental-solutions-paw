import { supabase } from "@/integrations/supabase/client";
import { PaymentMethodType, PaymentStatus } from "@/types/database/payment.types";

interface PaymentData {
  lease_id: string;
  amount: number;
  payment_method: PaymentMethodType;
  payment_date: string;
  status: PaymentStatus;
  is_recurring: boolean;
  recurring_interval?: string | null;
  next_payment_date?: string | null;
}

export const paymentService = {
  submitPayment: async (paymentData: PaymentData) => {
    const { data, error } = await supabase
      .from("unified_payments")
      .insert(paymentData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  reconcilePayment: async (paymentId: string) => {
    const { data, error } = await supabase
      .from("unified_payments")
      .update({ status: 'completed', updated_at: new Date().toISOString() })
      .eq('id', paymentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
import { supabase } from "@/integrations/supabase/client";
import { PaymentMethodType, PaymentStatus } from "@/types/database/agreement.types";

interface PaymentData {
  lease_id: string;
  amount: number;
  payment_method: PaymentMethodType;
  description?: string;
  payment_date: string;
  status: PaymentStatus;
  is_recurring: boolean;
  recurring_interval?: string | null;
  next_payment_date?: string | null;
}

export const submitPayment = async (paymentData: PaymentData) => {
  const { data, error } = await supabase
    .from("payments")
    .insert(paymentData)
    .select()
    .single();

  if (error) throw error;
  return data;
};
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
}

export const submitPayment = async (paymentData: PaymentData) => {
  const { data, error } = await supabase
    .from("unified_payments")
    .insert({
      lease_id: paymentData.lease_id,
      amount: paymentData.amount,
      amount_paid: paymentData.amount,
      payment_method: paymentData.payment_method,
      payment_date: paymentData.payment_date,
      status: paymentData.status,
      is_recurring: paymentData.is_recurring,
      recurring_interval: paymentData.recurring_interval,
      next_payment_date: paymentData.next_payment_date,
      type: 'Income'
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};
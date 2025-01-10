import { RawPaymentImport } from "@/types/database/payment.types";
import { supabase } from "@/integrations/supabase/client";

export const updatePaymentStatus = async (
  paymentId: string, 
  isValid: boolean, 
  errorDescription?: string
) => {
  const { error: updateError } = await supabase
    .from('raw_payment_imports')
    .update({ 
      is_valid: isValid,
      error_description: errorDescription || null
    })
    .eq('id', paymentId);

  if (updateError) throw updateError;
};

export const insertPayment = async (leaseId: string, payment: RawPaymentImport) => {
  // First check if payment already exists
  const { data: existingPayment, error: checkError } = await supabase
    .from('new_unified_payments')
    .select('id')
    .eq('lease_id', leaseId)
    .eq('payment_date', payment.Payment_Date)
    .eq('amount', payment.Amount)
    .maybeSingle();

  if (checkError) throw checkError;

  // If payment already exists, return early
  if (existingPayment) {
    console.log('Payment already exists:', existingPayment);
    return existingPayment;
  }

  const normalizedMethod = normalizePaymentMethod(payment.Payment_Method || '');
  
  const { data: paymentData, error: paymentError } = await supabase
    .from('new_unified_payments')
    .insert({
      lease_id: leaseId,
      amount: payment.Amount,
      amount_paid: payment.Amount,
      balance: 0,
      payment_method: normalizedMethod,
      payment_date: payment.Payment_Date,
      status: 'completed',
      description: payment.Description,
      type: payment.Type || 'Income',
      transaction_id: payment.Transaction_ID
    })
    .select()
    .single();

  if (paymentError) throw paymentError;
  return paymentData;
};

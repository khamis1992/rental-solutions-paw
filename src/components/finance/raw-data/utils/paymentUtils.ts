import { supabase } from "@/integrations/supabase/client";
import { UnifiedImportTracking } from "../../types/transaction.types";
import { normalizePaymentMethod } from "../../utils/paymentUtils";

export const createDefaultAgreement = async (payment: UnifiedImportTracking) => {
  const { data: agreementData, error: agreementError } = await supabase
    .rpc('create_default_agreement_if_not_exists', {
      p_agreement_number: payment.agreement_number,
      p_customer_name: payment.customer_name,
      p_amount: payment.amount
    });

  if (agreementError) throw agreementError;
  return agreementData;
};

export const insertPayment = async (leaseId: string, payment: UnifiedImportTracking) => {
  // First check if payment already exists
  const { data: existingPayment, error: checkError } = await supabase
    .from('unified_payments')
    .select('id')
    .eq('lease_id', leaseId)
    .eq('payment_date', payment.payment_date)
    .eq('amount', payment.amount)
    .maybeSingle();

  if (checkError) throw checkError;

  // If payment already exists, return early
  if (existingPayment) {
    console.log('Payment already exists:', existingPayment);
    return existingPayment;
  }

  const normalizedMethod = normalizePaymentMethod(payment.payment_method);
  
  const { data: paymentData, error: paymentError } = await supabase
    .from('unified_payments')
    .insert({
      lease_id: leaseId,
      amount: payment.amount,
      amount_paid: payment.amount,
      balance: 0,
      payment_method: normalizedMethod,
      payment_date: payment.payment_date,
      status: 'completed',
      description: payment.description,
      type: payment.type,
      transaction_id: payment.transaction_id,
      import_reference: payment.id,
      reconciliation_status: 'pending'
    })
    .select()
    .single();

  if (paymentError) throw paymentError;
  return paymentData;
};

export const updatePaymentStatus = async (
  paymentId: string, 
  isValid: boolean, 
  errorDescription?: string
) => {
  const { error: updateError } = await supabase
    .from('unified_import_tracking')
    .update({ 
      validation_status: isValid,
      error_details: errorDescription || null
    })
    .eq('id', paymentId);

  if (updateError) throw updateError;
};
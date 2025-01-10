import { PaymentMethodType } from "@/types/database/payment.types";
import { supabase } from "@/integrations/supabase/client";

export const normalizePaymentMethod = (method: string): PaymentMethodType => {
  const methodMap: Record<string, PaymentMethodType> = {
    'cash': 'Cash',
    'invoice': 'Invoice',
    'wire': 'WireTransfer',
    'wiretransfer': 'WireTransfer',
    'wire_transfer': 'WireTransfer',
    'cheque': 'Cheque',
    'check': 'Cheque',
    'deposit': 'Deposit',
    'onhold': 'On_hold',
    'on_hold': 'On_hold',
    'on-hold': 'On_hold'
  };

  const normalized = method.toLowerCase().replace(/[^a-z_]/g, '');
  return methodMap[normalized] || 'Cash';
};

export const createDefaultAgreement = async (
  agreementNumber: string,
  customerName: string,
  amount: number
): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .rpc('create_default_agreement_if_not_exists', {
        p_agreement_number: agreementNumber,
        p_customer_name: customerName,
        p_amount: amount
      });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating default agreement:', error);
    return null;
  }
};

export const updatePaymentStatus = async (id: string, isValid: boolean, errorDescription?: string) => {
  const { error } = await supabase
    .from('raw_payment_imports')
    .update({
      is_valid: isValid,
      error_description: errorDescription
    })
    .eq('id', id);

  if (error) {
    console.error('Error updating payment status:', error);
    throw error;
  }
};
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
    
    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        lease_id: paymentData.lease_id,
        amount: paymentData.amount,
        payment_date: paymentData.payment_date,
        status: paymentData.status,
        payment_method: paymentData.payment_method,
        description: paymentData.description,
        is_recurring: paymentData.is_recurring,
        recurring_interval: paymentData.recurring_interval,
        next_payment_date: paymentData.next_payment_date
      })
      .select()
      .single();

    if (paymentError) throw paymentError;

    // Create corresponding transaction record
    const { error: transactionError } = await supabase
      .from('accounting_transactions')
      .insert({
        amount: paymentData.amount,
        transaction_date: paymentData.payment_date,
        description: paymentData.description || 'Payment received',
        type: 'INCOME',
        status: 'completed',
        reference_type: 'payment',
        reference_id: payment.id,
        meta_data: {
          payment_id: payment.id,
          lease_id: paymentData.lease_id
        }
      });

    if (transactionError) {
      console.error('Error creating transaction:', transactionError);
      throw transactionError;
    }

    console.log('Payment submission successful');
    return payment;
  } catch (error) {
    console.error('Error in submitPayment:', error);
    throw error;
  }
};
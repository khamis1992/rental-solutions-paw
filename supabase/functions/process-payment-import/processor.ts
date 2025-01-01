import { createClient } from '@supabase/supabase-js';
import { PaymentData, ProcessingResult } from './types';

export const processPayments = async (supabaseClient: any, payments: PaymentData[]): Promise<ProcessingResult[]> => {
  console.log('Starting payment processing for', payments.length, 'records');
  
  const results: ProcessingResult[] = [];
  
  for (const payment of payments) {
    try {
      console.log('Processing payment:', payment);
      
      const { error: insertError } = await supabaseClient
        .from('payments')
        .insert({
          lease_id: payment.lease_id,
          amount: parseFloat(payment.amount.toString()),
          payment_date: payment.payment_date,
          payment_method: payment.payment_method || 'cash',
          status: payment.status || 'completed',
          description: payment.description,
          transaction_id: payment.transaction_id
        });

      if (insertError) {
        console.error('Insert error:', insertError);
        throw insertError;
      }

      results.push({ success: true, payment });
      console.log('Successfully processed payment:', payment.transaction_id);
    } catch (error) {
      console.error('Error processing payment:', error);
      results.push({ 
        success: false, 
        payment, 
        error: error.message 
      });
    }
  }

  return results;
};
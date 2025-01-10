import { supabase } from "@/integrations/supabase/client";
import { PaymentMethodType } from "@/types/database/payment.types";

export interface PaymentRequest {
  leaseId: string;
  amount: number;
  paymentMethod: PaymentMethodType;
  description?: string;
  type: 'Income' | 'Expense';  // Make type required
}

export const paymentService = {
  async processPayment(paymentData: PaymentRequest) {
    console.log('Calling payment service to process payment:', paymentData)
    
    try {
      const { data, error } = await supabase.functions.invoke('payment-service', {
        body: {
          operation: 'process_payment',
          data: paymentData
        }
      })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Payment processing error:', error)
      throw error
    }
  },

  async reconcilePayment(paymentId: string) {
    console.log('Calling payment service to reconcile payment:', paymentId)
    
    try {
      const { data, error } = await supabase.functions.invoke('payment-service', {
        body: {
          operation: 'reconcile_payment',
          data: { paymentId }
        }
      })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Payment reconciliation error:', error)
      throw error
    }
  }
}
import { supabase } from "@/integrations/supabase/client";

export interface PaymentRequest {
  leaseId: string;
  amount: number;
  paymentMethod: string;
  description?: string;
}

export const paymentService = {
  async processPayment(paymentData: PaymentRequest) {
    console.log('Calling payment service to process payment:', paymentData)
    
    // Ensure payment method has correct casing
    const normalizedPaymentMethod = paymentData.paymentMethod.charAt(0).toUpperCase() + 
                                  paymentData.paymentMethod.slice(1);
    
    const { data, error } = await supabase.functions.invoke('payment-service', {
      body: {
        operation: 'process_payment',
        data: {
          ...paymentData,
          paymentMethod: normalizedPaymentMethod
        }
      }
    })

    if (error) throw error
    return data
  },

  async reconcilePayment(paymentId: string) {
    console.log('Calling payment service to reconcile payment:', paymentId)
    
    const { data, error } = await supabase.functions.invoke('payment-service', {
      body: {
        operation: 'reconcile_payment',
        data: { paymentId }
      }
    })

    if (error) throw error
    return data
  }
}
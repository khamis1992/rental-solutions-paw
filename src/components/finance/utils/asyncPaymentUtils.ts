import { supabase } from "@/integrations/supabase/client";
import { PaymentMethodType, PaymentStatus } from "../types/transaction.types";

interface PaymentDetails {
  amount: number;
  leaseId: string;
  paymentMethod: PaymentMethodType;
  description?: string;
}

interface PaymentResult {
  success: boolean;
  data?: any;
  error?: string;
}

export async function processPaymentWithDb(
  details: PaymentDetails
): Promise<PaymentResult> {
  try {
    if (!validatePaymentDetails(details)) {
      return {
        success: false,
        error: "Invalid payment details"
      };
    }

    const { data, error } = await supabase
      .from("payments")
      .insert({
        amount: details.amount,
        lease_id: details.leaseId,
        payment_method: details.paymentMethod,
        description: details.description,
        status: 'completed',
        payment_date: new Date().toISOString(),
        type: 'Income'
      })
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data
    };
  } catch (error: any) {
    console.error("Payment processing error:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

export function validatePaymentDetails(details: PaymentDetails): boolean {
  return (
    details.amount > 0 &&
    !!details.leaseId &&
    !!details.paymentMethod
  );
}
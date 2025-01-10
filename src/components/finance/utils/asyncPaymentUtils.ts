import { supabase } from "@/integrations/supabase/client";
import { PaymentMethodType, PaymentStatus } from "@/types/database/payment.types";

interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

interface PaymentDetails {
  amount: number;
  leaseId: string;
  paymentMethod: PaymentMethodType;
  description?: string;
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
        status: 'completed' as PaymentStatus,
        payment_date: new Date().toISOString(),
        type: 'Income'
      })
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      transactionId: data.id
    };
  } catch (error) {
    console.error("Payment processing error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}

export function validatePaymentDetails(details: PaymentDetails): boolean {
  return (
    details.amount > 0 &&
    typeof details.leaseId === "string" &&
    details.leaseId.length > 0
  );
}

/**
 * Processes a payment without unnecessary async/await.
 * Returns a Promise directly when no await is needed.
 */
export function processSimplePayment(amount: number): Promise<PaymentResult> {
  if (amount <= 0) {
    return Promise.resolve({
      success: false,
      error: "Invalid amount"
    });
  }

  return Promise.resolve({
    success: true,
    transactionId: crypto.randomUUID()
  });
}

/**
 * Type-only async function for interface compliance.
 * async keyword used here only because the interface requires it.
 */
export async function initializePaymentSystem(): Promise<void> {
  // This function is async only because it needs to match an interface
  // that expects a Promise<void>
  return Promise.resolve();
}

/**
 * Retries a payment operation with exponential backoff.
 * async keyword required due to recursive await usage.
 */
export async function retryPayment(
  details: PaymentDetails,
  maxRetries = 3,
  attempt = 1
): Promise<PaymentResult> {
  try {
    return await processPaymentWithDb(details);
  } catch (error) {
    if (attempt >= maxRetries) {
      return {
        success: false,
        error: `Failed after ${maxRetries} attempts`
      };
    }

    // Exponential backoff delay
    const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
    await new Promise(resolve => setTimeout(resolve, delay));

    return retryPayment(details, maxRetries, attempt + 1);
  }
}

import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type PaymentStatus = 'pending' | 'completed' | 'failed';

interface PaymentDetails {
  amount: number;
  leaseId: string;
  description?: string;
  paymentMethod?: string;
}

interface ProcessedPayment {
  id: string;
  status: PaymentStatus;
  timestamp: string;
}

/**
 * Processes a payment with proper async handling and type safety.
 * Returns a Promise that resolves with the processed payment details.
 * 
 * Note: This function is explicitly marked async as it contains await expressions
 * and performs database operations.
 */
export async function processPayment(details: PaymentDetails): Promise<ProcessedPayment> {
  try {
    const { data, error } = await supabase
      .from('payments')
      .insert({
        lease_id: details.leaseId,
        amount: details.amount,
        payment_method: details.paymentMethod || 'cash',
        description: details.description,
        status: 'completed',
        payment_date: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      status: data.status,
      timestamp: data.payment_date,
    };
  } catch (error) {
    console.error('Payment processing error:', error);
    throw new Error('Failed to process payment');
  }
}

/**
 * Validates payment details synchronously.
 * Returns a Promise only because it needs to match a specific type signature.
 * Note: No async keyword needed as this function doesn't use await.
 */
export function validatePayment(details: PaymentDetails): Promise<boolean> {
  // Synchronous validation logic
  const isValid = 
    details.amount > 0 &&
    typeof details.leaseId === 'string' &&
    details.leaseId.length > 0;

  // Return Promise.resolve instead of making this an async function
  return Promise.resolve(isValid);
}

/**
 * Formats payment amount to QAR currency format.
 * Pure synchronous function, no Promise needed.
 */
export function formatPaymentAmount(amount: number): string {
  return new Intl.NumberFormat('en-QA', {
    style: 'currency',
    currency: 'QAR'
  }).format(amount);
}

/**
 * Example of a function that must be async for type compliance,
 * even though it could be synchronous in this implementation.
 * This pattern might be needed when implementing an interface
 * or when the function might become async in the future.
 */
export async function getPaymentStatus(id: string): Promise<PaymentStatus> {
  // Currently synchronous but might need to fetch from API in the future
  return 'completed';
}

/**
 * Handles payment notification with proper error boundaries.
 * Returns void as notifications don't need to be awaited.
 */
export function notifyPaymentStatus(status: PaymentStatus, amount: number): void {
  const formattedAmount = formatPaymentAmount(amount);
  
  switch (status) {
    case 'completed':
      toast.success(`Payment of ${formattedAmount} processed successfully`);
      break;
    case 'failed':
      toast.error(`Payment of ${formattedAmount} failed`);
      break;
    case 'pending':
      toast.info(`Payment of ${formattedAmount} is being processed`);
      break;
  }
}

/**
 * Example of converting a callback-based API to a Promise-based one.
 * This is a common pattern when working with legacy APIs.
 */
export function processLegacyPayment(details: PaymentDetails): Promise<ProcessedPayment> {
  return new Promise((resolve, reject) => {
    // Simulated legacy callback-based API
    setTimeout(() => {
      if (details.amount <= 0) {
        reject(new Error('Invalid amount'));
        return;
      }

      resolve({
        id: crypto.randomUUID(),
        status: 'completed',
        timestamp: new Date().toISOString()
      });
    }, 100);
  });
}
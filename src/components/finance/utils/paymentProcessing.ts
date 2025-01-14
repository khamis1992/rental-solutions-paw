import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PaymentMethodType, PaymentStatus } from "@/types/database/payment.types";

interface PaymentDetails {
  amount: number;
  leaseId: string;
  description?: string;
  paymentMethod?: PaymentMethodType;
}

interface ProcessedPayment {
  id: string;
  status: PaymentStatus;
  timestamp: string;
}

export async function processPayment(details: PaymentDetails): Promise<ProcessedPayment> {
  try {
    const { data, error } = await supabase
      .from('payments')
      .insert({
        amount: details.amount,
        lease_id: details.leaseId,
        payment_method: details.paymentMethod || 'Cash',
        description: details.description,
        status: 'completed' as PaymentStatus,
        payment_date: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      throw new Error('No data returned from insert operation');
    }

    return {
      id: data.id,
      status: data.status,
      timestamp: data.payment_date,
    };
  } catch (error) {
    if (error instanceof Error) {
      console.error('Payment processing error:', error);
      throw new Error('Failed to process payment');
    }
    throw error;
  }
}

export function validatePayment(details: PaymentDetails): Promise<boolean> {
  const isValid = 
    details.amount > 0 &&
    typeof details.leaseId === 'string' &&
    details.leaseId.length > 0;

  return Promise.resolve(isValid);
}

export function formatPaymentAmount(amount: number): string {
  return new Intl.NumberFormat('en-QA', {
    style: 'currency',
    currency: 'QAR'
  }).format(amount);
}

export async function getPaymentStatus(id: string): Promise<PaymentStatus> {
  return 'completed';
}

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

export function processLegacyPayment(details: PaymentDetails): Promise<ProcessedPayment> {
  return new Promise((resolve, reject) => {
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
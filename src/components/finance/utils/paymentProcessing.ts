import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PaymentMethodType, PaymentStatus } from "@/types/database/payment.types";

interface PaymentDetails {
  amount: number;
  leaseId: string;
  description?: string;
  paymentMethod?: PaymentMethodType;
  paymentDate?: Date;
}

interface ProcessedPayment {
  id: string;
  status: PaymentStatus;
  timestamp: string;
}

export async function processPayment(details: PaymentDetails): Promise<ProcessedPayment> {
  try {
    // Calculate due date (1st of the month)
    const paymentDate = details.paymentDate || new Date();
    const dueDate = new Date(paymentDate.getFullYear(), paymentDate.getMonth(), 1);

    // Calculate days overdue and late fine
    const daysOverdue = paymentDate > dueDate ? 
      Math.floor((paymentDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
    const lateFineAmount = daysOverdue * 120; // 120 QAR per day

    const { data, error } = await supabase
      .from('unified_payments')
      .insert({
        lease_id: details.leaseId,
        amount: details.amount,
        amount_paid: details.amount,
        balance: 0,
        payment_method: details.paymentMethod || 'Cash',
        description: details.description,
        type: 'Income',
        status: 'completed' as PaymentStatus,
        payment_date: paymentDate.toISOString(),
        due_date: dueDate.toISOString(),
        days_overdue: daysOverdue,
        late_fine_amount: lateFineAmount,
        reconciliation_status: 'pending'
      })
      .select('id, status, payment_date')
      .single();

    if (error) throw error;

    if (!data) {
      throw new Error('No data returned from insert operation');
    }

    return {
      id: data.id,
      status: data.status as PaymentStatus,
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
  const { data, error } = await supabase
    .from('unified_payments')
    .select('status')
    .eq('id', id)
    .single();

  if (error) throw error;
  return (data?.status || 'pending') as PaymentStatus;
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
    case 'refunded':
      toast.info(`Payment of ${formattedAmount} has been refunded`);
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
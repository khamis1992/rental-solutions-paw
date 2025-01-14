export type PaymentMethodType = 'Invoice' | 'Cash' | 'WireTransfer' | 'Cheque' | 'Deposit' | 'On_hold';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface Payment {
  id: string;
  lease_id: string;
  amount: number;
  amount_paid: number;
  balance: number;
  status: PaymentStatus | null;
  payment_date: string | null;
  transaction_id: string | null;
  payment_method: PaymentMethodType | null;
  security_deposit_id: string | null;
  created_at: string;
  updated_at: string;
  description: string | null;
  is_recurring: boolean;
  recurring_interval: string | null | unknown;
  next_payment_date: string | null;
  type: string;
  late_fine_amount: number;
  days_overdue: number;
}

export interface PaymentHistoryView extends Payment {
  actual_payment_date: string | null;
  original_due_date: string | null;
  agreement_number: string | null;
  customer_id: string | null;
  customer_name: string | null;
  customer_phone: string | null;
}

export interface OverduePaymentView {
  id: string;
  agreement_id: string;
  customer_id: string;
  total_amount: number;
  amount_paid: number;
  balance: number;
  last_payment_date: string | null;
  days_overdue: number;
  status: PaymentStatus;
  created_at: string;
  updated_at: string;
}
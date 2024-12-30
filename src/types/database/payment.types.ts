export type PaymentMethodType = 'Invoice' | 'Cash' | 'WireTransfer' | 'Cheque' | 'Deposit' | 'On_hold';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface Payment {
  id: string;
  lease_id: string;
  amount: number;
  status: PaymentStatus | null;
  payment_date: string | null;
  transaction_id: string | null;
  payment_method: PaymentMethodType | null;
  security_deposit_id: string | null;
  created_at: string;
  updated_at: string;
  description: string | null;
  is_recurring: boolean;
  recurring_interval: string | null | unknown; // Updated to handle Postgres interval type
  next_payment_date: string | null;
  type: string;
  late_fine_amount: number;
  days_overdue: number;
}
import { PaymentStatus, PaymentMethodType } from './agreement.types';

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
  recurring_interval: string | null;
  next_payment_date: string | null;
}

export interface PaymentHistory {
  id: string;
  lease_id: string;
  payment_id: string;
  original_due_date: string;
  actual_payment_date: string | null;
  amount_due: number;
  amount_paid: number | null;
  late_fee_applied: number | null;
  early_payment_discount: number | null;
  remaining_balance: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentSchedule {
  id: string;
  lease_id: string | null;
  due_date: string;
  amount: number;
  status: PaymentStatus | null;
  last_reminder_sent: string | null;
  reminder_count: number | null;
  metadata: Record<string, any> | null;
  contract_name: string | null;
  created_at: string;
  updated_at: string;
}
export type LeaseStatus = 'pending_payment' | 'pending_deposit' | 'active' | 'closed' | 'terminated' | 'cancelled';

export type PaymentMethodType = 'Invoice' | 'Cash' | 'WireTransfer' | 'Cheque' | 'Deposit' | 'On_hold';

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface Agreement {
  id: string;
  agreement_number: string;
  status: LeaseStatus;
  start_date: string;
  end_date: string;
  rent_amount: number;
}
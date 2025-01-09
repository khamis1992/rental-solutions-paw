export type LeaseStatus = 'pending_payment' | 'pending_deposit' | 'active' | 'closed' | 'terminated' | 'cancelled';

export interface Agreement {
  id: string;
  agreement_number: string;
  status: LeaseStatus;
  start_date: string;
  end_date: string;
  rent_amount: number;
}
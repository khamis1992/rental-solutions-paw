export type AgreementType = 'lease_to_own' | 'short_term';
export type DocumentLanguage = 'english' | 'arabic';
export type LeaseStatus = 'pending_payment' | 'pending_deposit' | 'active' | 'closed' | 'terminated' | 'cancelled';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface Agreement {
  id: string;
  agreement_number: string;
  agreement_type: AgreementType;
  customer_id: string;
  vehicle_id: string;
  start_date: string | null;
  end_date: string | null;
  status: LeaseStatus;
  initial_mileage: number;
  return_mileage: number | null;
  total_amount: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  payment_status: PaymentStatus | null;
  last_payment_date: string | null;
  next_payment_date: string | null;
  payment_frequency: string | null;
  rent_amount: number;
  remainingAmount: number;
  agreement_duration: string;
  daily_late_fee: number;
  customer?: {
    id: string;
    full_name: string | null;
  };
  vehicle?: {
    id: string;
    make: string;
    model: string;
    year: number;
    license_plate: string;
  };
}

export interface AgreementWithRelations extends Agreement {
  customer: {
    id: string;
    full_name: string | null;
    phone_number: string | null;
    address: string | null;
  };
  vehicle: {
    id: string;
    make: string;
    model: string;
    year: number;
    license_plate: string;
  };
}
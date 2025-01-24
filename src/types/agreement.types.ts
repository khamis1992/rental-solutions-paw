export type LeaseStatus = 'active' | 'pending' | 'expired' | 'cancelled';
export type AgreementType = 'short_term' | 'lease_to_own';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'cancelled';
export type DocumentLanguage = 'english' | 'arabic';

export interface Template {
  id: string;
  name: string;
  description?: string;
  content: string;
  language: DocumentLanguage;
  agreement_type: AgreementType;
  rent_amount: number;
  final_price: number;
  agreement_duration: string;
  daily_late_fee: number;
  damage_penalty_rate: number;
  late_return_fee: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  template_structure?: Record<string, any>;
  template_sections?: any[];
  variable_mappings?: Record<string, any>;
}

export interface Agreement {
  id: string;
  vehicle_id: string;
  customer_id: string;
  start_date: string | null;
  end_date: string | null;
  status: LeaseStatus;
  initial_mileage: number;
  return_mileage: number | null;
  total_amount: number;
  notes: string | null;
  agreement_type: AgreementType;
  agreement_number: string | null;
  rent_amount: number;
  rent_due_day: number | null;
  remainingAmount: number;
  customer?: {
    id: string;
    full_name: string | null;
    phone_number: string | null;
    address: string | null;
  };
  vehicle?: {
    id: string;
    make: string;
    model: string;
    year: number;
    license_plate: string;
  };
}

export interface Payment {
  id: string;
  lease_id: string;
  amount: number;
  amount_paid: number;
  balance: number;
  payment_date: string | null;
  transaction_id: string | null;
  payment_method: string;
  status: PaymentStatus;
  description: string;
  type: string;
  late_fine_amount: number;
  days_overdue: number;
  is_recurring?: boolean;
  security_deposit_id?: string;
  created_at: string;
  updated_at: string;
}

export interface AnomalyRecord {
  id: string;
  detection_type: string;
  severity: string;
  description: string;
  affected_records: {
    vehicle_id: string;
    license_plate: string;
    mileage: number;
  };
  detected_at: string;
  resolved_at: string | null;
  resolution_notes: string | null;
  false_positive: boolean;
}
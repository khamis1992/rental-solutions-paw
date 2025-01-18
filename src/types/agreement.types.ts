export type LeaseStatus = 'active' | 'pending_payment' | 'pending_deposit' | 'closed' | 'terminated' | 'cancelled';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type DocumentLanguage = 'english' | 'spanish' | 'french' | 'arabic';

export interface Template {
  id: string;
  name: string;
  description: string;
  agreement_type?: "lease_to_own" | "short_term";
  rent_amount?: number;
  final_price?: number;
  agreement_duration?: string;
  daily_late_fee?: number;
  damage_penalty_rate?: number;
  late_return_fee?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  content: string;
  language: DocumentLanguage;
  template_structure?: Record<string, any>;
  template_sections?: any[];
  variable_mappings?: Record<string, any>;
}

export interface AgreementWithRelations {
  id: string;
  agreement_number: string;
  customer: {
    id: string;
    full_name: string;
    email: string;
    phone_number: string;
    address: string;
    nationality: string;
  };
  vehicle: {
    id: string;
    make: string;
    model: string;
    year: number;
    color: string;
    license_plate: string;
    vin: string;
  };
  start_date: string;
  end_date: string;
  rent_amount: number;
  total_amount: number;
  status: LeaseStatus;
  agreement_type: "lease_to_own" | "short_term";
  payment_status: PaymentStatus;
}
export interface Agreement {
  id: string;
  agreement_number: string;
  status: LeaseStatus;
  start_date: string;
  end_date: string;
  rent_amount: number;
  contractValue: number;
  remainingAmount: number;
  vehicle?: {
    license_plate: string;
    make: string;
    model: string;
  };
  customer?: {
    full_name: string;
  };
}

export type LeaseStatus = 'active' | 'pending' | 'expired' | 'cancelled';

export interface Template {
  id: string;
  name: string;
  description: string;
  content: string;
  language: DocumentLanguage;
  agreement_type: 'lease_to_own' | 'short_term';
  rent_amount: number;
  final_price: number;
  agreement_duration: string;
  daily_late_fee: number;
  damage_penalty_rate: number;
  late_return_fee: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  template_structure: Record<string, any>;
  template_sections: any[];
  variable_mappings: Record<string, any>;
}

export type DocumentLanguage = 'english' | 'arabic';

export interface AgreementWithRelations {
  id: string;
  agreement_number: string;
  status: LeaseStatus;
  start_date: string;
  end_date: string;
  rent_amount: number;
  daily_late_fee: number;
  customer?: {
    full_name: string;
    email: string;
    phone_number: string;
    address: string;
    nationality: string;
  };
  vehicle?: {
    make: string;
    model: string;
    year: number;
    color: string;
    license_plate: string;
    vin: string;
  };
}

export interface Payment {
  id: string;
  lease_id: string;
  amount: number;
  amount_paid: number;
  balance: number;
  payment_date: string;
  payment_method: string;
  status: string;
  description: string;
  type: string;
  late_fine_amount: number;
  days_overdue: number;
  created_at: string;
  updated_at: string;
  transaction_id: string;
  security_deposit_id: string;
  is_recurring: boolean;
  next_payment_date?: string;
}
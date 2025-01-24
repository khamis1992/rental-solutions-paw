export type LeaseStatus = 'pending_payment' | 'pending_deposit' | 'active' | 'closed';
export type AgreementType = 'lease_to_own' | 'short_term';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type DocumentLanguage = 'english' | 'arabic';

export interface Agreement {
  id: string;
  agreement_number: string | null;
  status: LeaseStatus;
  start_date: string;
  end_date: string;
  rent_amount: number;
  contractValue: number;
  remainingAmount: number;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  content: string;
  language: DocumentLanguage;
  agreement_type: AgreementType;
  rent_amount: number;
  final_price: number;
  agreement_duration: string;
  daily_late_fee: number;
  damage_penalty_rate: number;
  late_return_fee: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  template_structure: Record<string, any>;
  template_sections: any[];
  variable_mappings: Record<string, any>;
}

export interface AgreementWithRelations extends Omit<Agreement, 'remainingAmount'> {
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
  remainingAmount: {
    remaining_amount: number;
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
export type LeaseStatus = 'active' | 'pending_payment' | 'pending_deposit' | 'closed' | 'terminated' | 'cancelled';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type PaymentMethodType = 'Invoice' | 'Cash' | 'WireTransfer' | 'Cheque' | 'Deposit' | 'On_hold';
export type DocumentLanguage = 'english' | 'spanish' | 'french' | 'arabic';

export interface AgreementWithRelations {
  id: string;
  agreement_number: string | null;
  agreement_type: "lease_to_own" | "short_term";
  start_date: string | null;
  end_date: string | null;
  rent_amount: number;
  total_amount: number;
  daily_late_fee: number;
  customer?: {
    id: string;
    full_name: string | null;
    phone_number: string | null;
    address: string | null;
    nationality: string | null;
    email: string | null;
  };
  vehicle?: {
    id: string;
    make: string;
    model: string;
    year: number;
    license_plate: string;
  };
}

export interface Template {
  id: string;
  name: string;
  description?: string;
  content: string;
  language: DocumentLanguage;
  template_structure: Record<string, any>;
  template_sections: any[];
  variable_mappings: Record<string, any>;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

export interface Payment {
  id: string;
  lease_id: string;
  amount: number;
  amount_paid: number;
  balance: number;
  payment_date: string | null;
  transaction_id: string | null;
  payment_method: PaymentMethodType | null;
  status: PaymentStatus;
  description: string | null;
  type: string;
  is_recurring: boolean;
  recurring_interval: string | null;
  next_payment_date: string | null;
  late_fine_amount: number;
  days_overdue: number;
  security_deposit_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentHistory {
  id: string;
  lease_id: string;
  amount_due: number;
  amount_paid: number;
  remaining_balance: number;
  actual_payment_date: string | null;
  original_due_date: string | null;
  late_fee_applied: number;
  status: PaymentStatus;
  created_at: string;
  updated_at: string;
}
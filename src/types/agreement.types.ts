export type LeaseStatus = 
  | 'pending_payment'
  | 'active'
  | 'completed'
  | 'terminated'
  | 'cancelled';

export type AgreementType = 'short_term' | 'lease_to_own';

export type PaymentStatus = 'pending' | 'completed' | 'cancelled';

export interface Agreement {
  id: string;
  agreement_number: string;
  customer_id: string;
  vehicle_id: string;
  start_date: string;
  end_date: string;
  status: LeaseStatus;
  total_amount: number;
  rent_amount: number;
  daily_late_fee: number;
  remaining_amount: number;
  agreement_type: AgreementType;
  customer?: {
    id: string;
    full_name: string;
    phone_number: string;
  };
  vehicle?: {
    id: string;
    make: string;
    model: string;
    license_plate: string;
  };
}

export interface AgreementWithRelations extends Agreement {
  agreement_templates?: {
    content: string;
  };
  customer: {
    full_name: string;
    phone_number: string;
    email: string;
    address: string;
    nationality: string;
    driver_license: string;
  };
  vehicle: {
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
  payment_date: string | null;
  transaction_id: string | null;
  payment_method: string | null;
  security_deposit_id: string | null;
  created_at: string;
  updated_at: string;
  description: string | null;
  is_recurring: boolean;
  recurring_interval: string | null;
  next_payment_date: string | null;
  type: string;
  late_fine_amount: number;
  days_overdue: number;
  status: PaymentStatus;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  content: string;
  language: string;
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
  template_structure: {
    textStyle: TextStyle;
    tables: Table[];
  };
  template_sections: any[];
  variable_mappings: Record<string, any>;
}

export interface TextStyle {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  align?: 'left' | 'center' | 'right';
  size?: number;
}

export interface Table {
  headers: string[];
  rows: string[][];
  style?: TextStyle;
}
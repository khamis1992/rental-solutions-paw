export interface TextStyle {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  fontSize: number;
  alignment: 'left' | 'center' | 'right' | 'justify';
}

export interface Table {
  rows: {
    cells: {
      content: string;
      style: TextStyle;
    }[];
  }[];
  style?: {
    width: string;
    borderCollapse: string;
    borderSpacing: string;
  };
}

export interface Template {
  id: string;
  name: string;
  description: string;
  content: string;
  language: string;
  agreement_type: AgreementType;
  rent_amount?: number;
  final_price?: number;
  agreement_duration: string;
  daily_late_fee?: number;
  damage_penalty_rate?: number;
  late_return_fee?: number;
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

export type AgreementType = 'short_term' | 'lease_to_own';

export type LeaseStatus = 
  | 'pending_payment'
  | 'pending_deposit'
  | 'active'
  | 'closed'
  | 'terminated'
  | 'cancelled';

export interface Agreement {
  id: string;
  agreement_number: string;
  agreement_type: AgreementType;
  customer_id: string;
  vehicle_id: string;
  start_date: string | null;
  end_date: string | null;
  status: LeaseStatus;
  total_amount: number;
  initial_mileage: number;
  return_mileage: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  rent_amount: number;
  remaining_amount: number;
  daily_late_fee: number;
  payment_status: string;
  last_payment_date: string | null;
  next_payment_date: string | null;
  payment_frequency: string;
  customer?: {
    id: string;
    full_name: string | null;
    phone_number: string | null;
  };
  vehicle?: {
    id: string;
    make: string;
    model: string;
    year: number;
    license_plate: string;
  };
}
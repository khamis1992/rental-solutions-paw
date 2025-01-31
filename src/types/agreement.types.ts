export type LeaseStatus = 'pending_payment' | 'pending_deposit' | 'active' | 'closed' | 'cancelled' | 'terminated';
export type AgreementType = 'short_term' | 'lease_to_own';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

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
  style: {
    width: string;
    borderCollapse: 'collapse' | 'separate';
    borderSpacing: string;
  };
}

export interface TemplateLayout {
  letterhead?: {
    enabled: boolean;
    height: number;
    content?: string;
  };
  logo?: {
    enabled: boolean;
    position: 'left' | 'center' | 'right';
    size: number;
    url?: string;
  };
  watermark?: {
    enabled: boolean;
    text: string;
    opacity: number;
  };
  pageNumbering?: {
    enabled: boolean;
    position: 'top' | 'bottom';
    format: 'numeric' | 'roman';
  };
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
    layout: TemplateLayout;
  };
  template_sections: any[];
  variable_mappings: Record<string, any>;
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
  daily_late_fee: number;
  customer?: {
    id: string;
    full_name: string | null;
    phone_number: string | null;
    address: string | null;
    nationality?: string | null;
    driver_license?: string | null;
    email?: string | null;
  };
  vehicle?: {
    id: string;
    make: string;
    model: string;
    year: number;
    license_plate: string;
    vin?: string;
    color?: string;
  };
  created_at: string;
  updated_at: string;
  payment_status: string;
  last_payment_date: string | null;
  next_payment_date: string | null;
  payment_frequency: string | null;
  down_payment?: number | null;
  contractValue?: number;
}

export interface AgreementWithRelations extends Agreement {
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
  is_recurring: boolean;
  security_deposit_id?: string;
  created_at: string;
  updated_at: string;
}
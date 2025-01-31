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
    borderCollapse: string;
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
  agreement_type: 'short_term' | 'lease_to_own';
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
    layout: TemplateLayout;
  };
  template_sections: any[];
  variable_mappings: Record<string, any>;
}

export type LeaseStatus = 'pending_payment' | 'pending_deposit' | 'active' | 'closed' | 'terminated' | 'cancelled';
export type AgreementType = 'short_term' | 'lease_to_own';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type PaymentMethodType = 'Invoice' | 'Cash' | 'WireTransfer' | 'Cheque' | 'Deposit' | 'On_hold';

export interface Agreement {
  id: string;
  agreement_number: string;
  agreement_type: AgreementType;
  status: LeaseStatus;
  start_date: string;
  end_date: string;
  rent_amount: number;
  contractValue: number;
  remainingAmount: number;
}

export interface AgreementWithRelations extends Agreement {
  customer?: {
    id: string;
    full_name: string;
    phone_number: string;
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
  payment_date: string;
  payment_method: string;
  status: PaymentStatus;
  description: string;
  type: string;
  transaction_id: string;
  security_deposit_id: string;
  is_recurring: boolean;
  recurring_interval: string;
  late_fine_amount: number;
  days_overdue: number;
  created_at: string;
  updated_at: string;
}
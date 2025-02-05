import { Database } from "./database.types";

export type LeaseStatus = Database['public']['Enums']['lease_status'];
export type AgreementType = Database['public']['Enums']['agreement_type'];
export type PaymentStatus = Database['public']['Enums']['payment_status'];
export type PaymentMethodType = Database['public']['Enums']['payment_method_type'];

export interface AgreementWithRelations extends Agreement {
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

export interface Agreement {
  id: string;
  agreement_number: string | null;
  agreement_type: AgreementType;
  customer_id: string;
  vehicle_id: string;
  start_date: string | null;
  end_date: string | null;
  status: LeaseStatus | null;
  total_amount: number;
  initial_mileage: number;
  return_mileage: number | null;
  notes: string | null;
  down_payment: number | null;
  monthly_payment: number | null;
  interest_rate: number | null;
  lease_duration: string | null;
  early_payoff_allowed: boolean | null;
  ownership_transferred: boolean | null;
  trade_in_value: number | null;
  late_fee_rate: number | null;
  late_fee_grace_period: string | null;
  damage_penalty_rate: number | null;
  fuel_penalty_rate: number | null;
  late_return_fee: number | null;
  created_at: string;
  updated_at: string;
  daily_late_fee: number;
  rent_amount: number;
  rent_due_day: number | null;
  remainingAmount: number;
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

interface TextStyle {
  font?: string;
  size?: number;
  color?: string;
  alignment?: 'left' | 'right' | 'center';
  direction?: 'ltr' | 'rtl';
}

interface Table {
  headers: string[];
  rows: any[][];
  style?: TextStyle;
}

export interface Payment {
  id: string;
  lease_id: string;
  amount: number;
  amount_paid: number;
  balance: number;
  payment_date: string;
  transaction_id?: string;
  payment_method: string;
  status: string;
  description: string;
  type: string;
  security_deposit_id?: string;
  is_recurring: boolean;
  recurring_interval?: string;
  next_payment_date?: string;
  late_fine_amount: number;
  days_overdue: number;
  created_at: string;
  updated_at: string;
}
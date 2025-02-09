
import { Database } from "@/integrations/supabase/types";

export type LeaseStatus = Database['public']['Enums']['lease_status'];
export type AgreementType = Database['public']['Enums']['agreement_type'];
export type PaymentStatus = Database['public']['Enums']['payment_status'];

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

export interface Agreement {
  id: string;
  agreement_number: string | null;
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
  rent_amount: number;
  remaining_amount: number;
  daily_late_fee: number;
  payment_status?: string;
  last_payment_date?: string | null;
  next_payment_date?: string | null;
  payment_frequency?: string;
  template_id?: string;
  created_at: string;
  updated_at: string;
  customer?: {
    id: string;
    full_name: string | null;
    phone_number: string | null;
    email?: string | null;
    status?: string;
  };
  vehicle?: {
    id: string;
    make: string;
    model: string;
    year: number;
    license_plate: string;
  };
  remaining_amounts?: {
    remaining_amount: number;
  }[];
}

export interface Payment {
  id: string;
  lease_id: string;
  amount: number;
  amount_paid: number;
  balance: number;
  status: PaymentStatus;
  payment_date: string | null;
  transaction_id: string | null;
  payment_method: string;
  security_deposit_id: string | null;
  created_at: string;
  updated_at: string;
  description: string | null;
  is_recurring: boolean;
  recurring_interval?: string | null;
  next_payment_date?: string | null;
  type: string;
  late_fine_amount: number;
  days_overdue: number;
}

export interface Transaction {
  id: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  transaction_date: string;
  description: string;
  status: string;
  category: {
    id: string;
    name: string;
  };
}

export interface MaintenanceStatus {
  status: 'cancelled' | 'completed' | 'scheduled' | 'in_progress' | 'urgent' | 'accident';
}

export interface DashboardStats {
  total_vehicles: number;
  available_vehicles: number;
  rented_vehicles: number;
  maintenance_vehicles: number;
  total_customers: number;
  active_rentals: number;
  monthly_revenue: number;
}

export interface ReportSchedule {
  id?: string;
  report_type: string;
  frequency: string;
  format: string;
  recipients: string[];
  is_active?: boolean;
  last_run_at?: string;
  next_run_at?: string;
  created_at?: string;
  updated_at?: string;
}

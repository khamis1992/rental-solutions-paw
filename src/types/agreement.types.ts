import { Database } from "@/integrations/supabase/types";

export type LeaseStatus = Database['public']['Enums']['lease_status'];
export type AgreementType = Database['public']['Enums']['agreement_type'];
export type PaymentStatus = Database['public']['Enums']['payment_status'];

export interface Agreement {
  id: string;
  agreement_number: string;
  agreement_type: AgreementType;
  customer_id: string;
  vehicle_id: string;
  start_date: string;
  end_date: string;
  status: LeaseStatus;
  initial_mileage: number;
  return_mileage?: number;
  total_amount: number;
  rent_amount: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  remainingAmount: number;
  daily_late_fee?: number;
  vehicle?: {
    make: string;
    model: string;
    year: number;
    license_plate: string;
  };
  customer?: {
    full_name: string;
    phone_number?: string;
    email?: string;
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
  status: PaymentStatus;
  description: string | null;
  type: string;
  is_recurring: boolean;
  recurring_interval: string | null;
  next_payment_date: string | null;
  late_fine_amount: number;
  days_overdue: number;
  created_at: string;
  updated_at: string;
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
  template_structure: Record<string, any>;
  template_sections: any[];
  variable_mappings: Record<string, any>;
}

export interface AgreementWithRelations extends Omit<Agreement, 'remainingAmount'> {
  remainingAmount: {
    remaining_amount: number;
  }[];
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
  recipients: string[];
  format: string;
  last_run_at?: string;
  next_run_at?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}
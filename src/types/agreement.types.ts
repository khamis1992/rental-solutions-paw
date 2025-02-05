import { Database } from "@/integrations/supabase/types";

export type LeaseStatus = Database['public']['Enums']['lease_status'];
export type AgreementType = Database['public']['Enums']['agreement_type'];
export type PaymentStatus = Database['public']['Enums']['payment_status'];

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
  remainingAmount: {
    remaining_amount: number;
  };
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
  is_recurring?: boolean;
  security_deposit_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Template {
  id: string;
  name: string;
  description?: string;
  content: string;
  language: string;
  agreement_type: AgreementType;
  template_structure: {
    textStyle: {
      direction: 'rtl' | 'ltr';
      fontFamily: string;
      fontSize: number;
    };
    tables: {
      id: string;
      rows: number;
      cols: number;
      data: string[][];
    }[];
  };
  created_at: string;
  updated_at: string;
}
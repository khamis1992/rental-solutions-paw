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

export interface AgreementDocument {
  id: string;
  lease_id: string;
  document_type: string;
  document_url: string;
  uploaded_by: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface PaymentScheduleItem {
  dueDate: Date;
  amount: number;
  remainingBalance: number;
  status?: PaymentStatus;
}

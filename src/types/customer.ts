import { Database } from "@/integrations/supabase/types";

export type CustomerStatus = Database['public']['Enums']['customer_status_type'];
export type UserRole = Database['public']['Enums']['user_role'];

export interface Customer {
  id: string;
  full_name: string | null;
  phone_number: string | null;
  address: string | null;
  driver_license: string | null;
  id_document_url: string | null;
  license_document_url: string | null;
  contract_document_url: string | null;
  created_at: string;
  role: UserRole;
  status: CustomerStatus;
  status_updated_at: string | null;
  status_notes: string | null;
}

export interface CustomerNote {
  id: string;
  customer_id: string;
  note: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface CreditAssessment {
  id: string;
  customer_id: string;
  credit_score: number;
  monthly_income: number;
  employment_status: string;
  debt_to_income_ratio: number | null;
  assessment_date: string;
  status: string;
  notes: string | null;
}
import { Database } from "./database.types";

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
  role: UserRole | null;
  created_at: string;
  updated_at: string;
  status: CustomerStatus | null;
  status_updated_at: string | null;
  status_notes: string | null;
  is_ai_generated?: boolean;
  ai_confidence_score?: number;
  ai_generated_fields?: Record<string, any>;
  needs_review?: boolean;
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
  created_at: string;
  updated_at: string;
}

export interface RiskAssessment {
  id: string;
  customer_id: string;
  payment_score: number;
  risk_level: string;
  late_payment_count: number;
  missed_payment_count: number;
  total_penalties: number;
  assessment_date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
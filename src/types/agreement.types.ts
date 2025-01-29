import { Database } from "@/integrations/supabase/types";
import { Json } from "@/types/database/database.types";

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
  total_amount: number;
  rent_amount: number;
  remaining_amount: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  daily_late_fee?: number;
  down_payment?: number;
  initial_mileage: number;
  return_mileage?: number;
  payment_status?: string;
  last_payment_date?: string;
  next_payment_date?: string;
  payment_frequency?: string;
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

export interface AgreementWithRelations extends Agreement {
  customer: {
    id: string;
    full_name: string;
    phone_number?: string;
    email?: string;
  };
  vehicle: {
    id: string;
    make: string;
    model: string;
    year: number;
    license_plate: string;
  };
}

export interface TextStyle {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  fontSize: number;
  alignment: 'left' | 'center' | 'right' | 'justify';
}

export interface TableCell {
  content: string;
  style?: TextStyle;
}

export interface TableRow {
  cells: TableCell[];
}

export interface Table {
  rows: TableRow[];
  style?: {
    width: string;
    borderCollapse: 'collapse' | 'separate';
    borderSpacing?: string;
  };
}

export interface TemplateStructure {
  textStyle?: TextStyle;
  tables?: Table[];
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
  damage_penalty_rate?: number;
  late_return_fee?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  template_structure: TemplateStructure;
  template_sections: any[];
  variable_mappings: Record<string, any>;
}

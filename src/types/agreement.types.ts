import { Database } from "./database/database.types";

export type LeaseStatus = Database['public']['Enums']['lease_status'];
export type AgreementType = "lease_to_own" | "short_term";
export type DocumentLanguage = "english" | "arabic";
export type PaymentStatus = "pending" | "completed" | "failed" | "cancelled";

export interface Template {
  id: string;
  name: string;
  description: string;
  content: string;
  language: DocumentLanguage;
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

export interface Agreement {
  id: string;
  agreement_number: string;
  status: LeaseStatus;
  start_date: string;
  end_date: string;
  rent_amount: number;
  contractValue: number;
  remainingAmount: number;
  customer_id: string;
  vehicle_id: string;
  initial_mileage: number;
  agreement_type: AgreementType;
  daily_late_fee: number;
  agreement_duration: string;
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
  late_fine_amount: number;
  days_overdue: number;
  transaction_id: string;
  security_deposit_id: string;
  is_recurring: boolean;
  next_payment_date: string;
  created_at: string;
  updated_at: string;
}

export interface AgreementWithRelations extends Agreement {
  customer: {
    id: string;
    full_name: string | null;
    phone_number: string | null;
    email: string | null;
    address: string | null;
    nationality: string | null;
  };
  vehicle: {
    id: string;
    make: string;
    model: string;
    year: number;
    license_plate: string;
    vin: string;
    color: string;
  };
}
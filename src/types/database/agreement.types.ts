import { Database } from "./database.types";

export type LeaseStatus = Database['public']['Enums']['lease_status'];
export type AgreementType = Database['public']['Enums']['agreement_type'];
export type PaymentStatus = Database['public']['Enums']['payment_status'];
export type PaymentMethodType = Database['public']['Enums']['payment_method_type'];

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
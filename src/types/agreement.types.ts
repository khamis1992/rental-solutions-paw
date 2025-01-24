export type LeaseStatus = "pending_payment" | "pending_deposit" | "active" | "closed" | "terminated" | "cancelled";
export type AgreementType = "lease_to_own" | "short_term";
export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";
export type DocumentLanguage = "english" | "arabic";

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
  created_at: string;
  updated_at: string;
  daily_late_fee: number;
  rent_amount: number;
  remainingAmount: number;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  agreement_type: AgreementType;
  rent_amount: number;
  final_price: number;
  agreement_duration: string;
  daily_late_fee: number;
  damage_penalty_rate?: number;
  late_return_fee?: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  content?: string;
  language?: DocumentLanguage;
  template_structure: Record<string, any>;
  template_sections: any[];
  variable_mappings: Record<string, any>;
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
  transaction_id?: string;
  security_deposit_id?: string;
  is_recurring?: boolean;
  recurring_interval?: string;
  next_payment_date?: string;
  created_at: string;
  updated_at: string;
}

export interface AnomalyRecord {
  id: string;
  detection_type: string;
  severity: string;
  description: string;
  affected_records: {
    vehicle_id: string;
    license_plate: string;
    mileage: number;
  };
  detected_at: string;
  resolved_at: string | null;
  resolution_notes: string | null;
  false_positive: boolean;
}

export interface DashboardStats {
  totalVehicles: number;
  availableVehicles: number;
  rentedVehicles: number;
  maintenanceVehicles: number;
  totalCustomers: number;
  activeRentals: number;
  monthlyRevenue: number;
}
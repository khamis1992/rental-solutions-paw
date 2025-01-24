export type AgreementType = 'lease_to_own' | 'short_term';
export type DocumentLanguage = 'english' | 'arabic';
export type LeaseStatus = 'pending_payment' | 'pending_deposit' | 'active' | 'closed' | 'terminated' | 'cancelled';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

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
  daily_late_fee?: number;
  damage_penalty_rate?: number;
  late_return_fee?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  template_structure: Record<string, any>;
  template_sections: any[];
  variable_mappings: Record<string, any>;
}

export interface Agreement {
  id: string;
  vehicle_id: string;
  customer_id: string;
  start_date?: string;
  end_date?: string;
  status: LeaseStatus;
  initial_mileage: number;
  return_mileage?: number;
  total_amount: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  agreement_type: AgreementType;
  agreement_number: string;
  rent_amount: number;
  remainingAmount: number;
  agreement_duration: string;
  daily_late_fee: number;
}

export interface AgreementWithRelations extends Agreement {
  customer: {
    full_name: string;
    phone_number?: string;
    email?: string;
  };
  vehicle: {
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
  payment_date: string;
  payment_method: string;
  status: PaymentStatus;
  description: string;
  type: string;
  transaction_id?: string;
  security_deposit_id?: string;
  is_recurring: boolean;
  recurring_interval?: string;
  late_fine_amount: number;
  days_overdue: number;
  created_at: string;
  updated_at: string;
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
  resolved_at?: string;
  resolution_notes?: string;
  false_positive: boolean;
}
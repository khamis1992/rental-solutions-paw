export interface Agreement {
  id: string;
  vehicle_id: string;
  customer_id: string;
  start_date: string | null;
  end_date: string | null;
  status: string;
  initial_mileage: number;
  return_mileage: number | null;
  total_amount: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  agreement_type: "lease_to_own" | "short_term";
  down_payment: number | null;
  monthly_payment: number | null;
  interest_rate: number | null;
  lease_duration: string | null;
  agreement_number: string | null;
  rent_amount: number;
  rent_due_day: number | null;
  remaining_amount: number;
  daily_late_fee: number;
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

export interface Template {
  id: string;
  name: string;
  description: string;
  content: string;
  language: string;
  agreement_type: "lease_to_own" | "short_term";
  rent_amount: number;
  final_price: number;
  agreement_duration: string;
  daily_late_fee: number;
  damage_penalty_rate: number;
  late_return_fee: number;
  created_at: string;
  updated_at: string;
  template_structure: any;
  template_sections: any[];
  variable_mappings: any;
}

export interface Payment {
  id: string;
  lease_id: string;
  amount: number;
  amount_paid: number;
  balance: number;
  payment_date: string;
  payment_method: string;
  status: string;
  description: string;
  type: string;
  late_fine_amount: number;
  days_overdue: number;
  transaction_id: string | null;
  security_deposit_id: string | null;
  is_recurring: boolean;
  created_at: string;
  updated_at: string;
}
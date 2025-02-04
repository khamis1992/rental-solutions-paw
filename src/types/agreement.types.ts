export interface AgreementWithRelations {
  id: string;
  agreement_number: string;
  customer_id: string;
  vehicle_id: string;
  start_date: string;
  end_date: string;
  status: string;
  total_amount: number;
  rent_amount: number;
  daily_late_fee: number;
  remaining_amount: number;
  customer?: {
    id: string;
    full_name: string;
    phone_number: string;
  };
  vehicle?: {
    id: string;
    make: string;
    model: string;
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
  payment_method: string | null;
  security_deposit_id: string | null;
  created_at: string;
  updated_at: string;
  description: string | null;
  is_recurring: boolean;
  recurring_interval: string | null;
  next_payment_date: string | null;
  type: string;
  late_fine_amount: number;
  days_overdue: number;
}

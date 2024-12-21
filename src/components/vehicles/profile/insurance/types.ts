export interface InsuranceFormData {
  policy_number: string;
  provider: string;
  coverage_type: string;
  coverage_amount: string;
  premium_amount: string;
  start_date: string;
  end_date: string;
}

export interface Insurance extends InsuranceFormData {
  id: string;
  vehicle_id: string;
  created_at: string;
  updated_at: string;
}
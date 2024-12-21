export interface InsuranceFormData {
  id?: string;
  vehicle_id: string;
  policy_number: string;
  provider: string;
  coverage_type: string;
  coverage_amount: number;
  premium_amount: number;
  start_date: string;
  end_date: string;
  status?: string;
}
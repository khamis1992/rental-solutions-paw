export interface RawPaymentImport {
  id: string;
  transaction_id: string;
  agreement_number: string;
  customer_name: string;
  license_plate: string;
  amount: number;
  payment_method: string;
  description: string;
  payment_date: string;
  type: string;
  status: string;
  is_valid?: boolean;
  error_description?: string;
  created_at?: string;
}
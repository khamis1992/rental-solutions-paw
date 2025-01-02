export interface AccountingTransaction {
  id: string;
  transaction_id: string | null;
  agreement_number: string | null;
  customer_name: string | null;
  license_plate: string | null;
  amount: string | null;
  payment_method: string | null;
  description: string | null;
  transaction_date: string | null;
  type: string | null;
  status: string | null;
  category_id: string | null;
  receipt_url: string | null;
  created_at: string | null;
  updated_at: string | null;
}
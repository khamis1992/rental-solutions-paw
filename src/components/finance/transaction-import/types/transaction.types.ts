export interface ImportedTransaction {
  agreement_number?: string;
  customer_name?: string;
  amount: number;
  license_plate?: string;
  vehicle?: string;
  payment_date?: string;
  payment_method?: string;
  payment_number?: string;
  description?: string;
  transaction_date: string;
  category?: string;
  status?: string;
}

export type TransactionAmountType = 'income' | 'expense' | 'refund';

export interface TransactionAmount {
  id?: string;
  transaction_id?: string;
  amount: number;
  type: TransactionAmountType;
  category?: string;
  recorded_date?: string;
  month_year?: string;
  created_at?: string;
  updated_at?: string;
}
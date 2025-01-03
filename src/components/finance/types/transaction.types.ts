export type TransactionType = 'INCOME' | 'EXPENSE';

export interface Transaction {
  id: string;
  agreement_number: string | null;
  amount: number;
  category_id: string | null;
  created_at: string | null;
  customer_name: string | null;
  description: string | null;
  license_plate: string | null;
  payment_method: string | null;
  receipt_url: string | null;
  status: string | null;
  transaction_date: string | null;
  type: TransactionType;
  updated_at: string | null;
  category: {
    id: string;
    name: string;
    type: string;
    budget_limit: number;
    budget_period: string;
  };
}

export interface TransactionFormData {
  amount: number;
  category_id: string;
  description: string;
  payment_method: string;
  type: TransactionType;
}
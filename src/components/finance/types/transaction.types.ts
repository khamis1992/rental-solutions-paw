export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

export interface Transaction {
  id: string;
  agreement_number: string;
  amount: number;
  category_id: string;
  created_at: string;
  customer_name: string;
  description: string;
  license_plate: string;
  payment_method: string;
  receipt_url: string;
  status: string;
  transaction_date: string;
  type: TransactionType;
  updated_at: string;
  category: {
    id: string;
    name: string;
    type: string;
    budget_limit: number;
    budget_period: string;
  };
}
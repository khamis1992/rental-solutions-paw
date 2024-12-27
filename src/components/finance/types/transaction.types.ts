export interface Category {
  id: string;
  name: string;
  type: string;
  budget_limit: number;
  budget_period: string;
}

export interface Transaction {
  id: string;
  amount: number;
  category_id: string;
  description: string;
  transaction_date: string;
  receipt_url: string | null;
  reference_type: string | null;
  reference_id: string | null;
  recurring_schedule: any | null;
  status: string;
  created_at: string;
  updated_at: string;
  cost_type: string | null;
  is_recurring: boolean;
  recurrence_interval: string | null;
  type: 'INCOME' | 'EXPENSE';
  category?: Category;
}
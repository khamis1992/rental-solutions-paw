export interface ImportedTransaction {
  amount: number;
  transaction_date: string;
  category?: string;
  description?: string;
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
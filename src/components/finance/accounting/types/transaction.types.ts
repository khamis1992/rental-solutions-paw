export interface TransactionFormData {
  type: 'income' | 'expense' | 'payment';
  amount: number;
  category_id?: string;
  description: string;
  transaction_date: string;
  receipt?: File;
  cost_type?: 'fixed' | 'variable';
  is_recurring?: boolean;
  paymentMethod?: string;
  intervalValue?: number;
  intervalUnit?: 'days' | 'weeks' | 'months';
}
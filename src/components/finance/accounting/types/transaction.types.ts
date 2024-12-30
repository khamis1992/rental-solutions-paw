export type PaymentMethodType = 'Invoice' | 'Cash' | 'WireTransfer' | 'Cheque' | 'Deposit' | 'On_hold';

export interface TransactionFormData {
  type: 'income' | 'expense' | 'payment';
  amount: number;
  category_id?: string;
  description: string;
  transaction_date: string;
  receipt?: FileList;
  cost_type?: 'fixed' | 'variable';
  is_recurring?: boolean;
  paymentMethod?: PaymentMethodType;
  intervalValue?: number;
  intervalUnit?: 'days' | 'weeks' | 'months';
}
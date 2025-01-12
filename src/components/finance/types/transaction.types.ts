export interface Transaction {
  id: string;
  amount: number;
  description: string;
  transaction_date: string;
  category: Category;
  type: TransactionType;
  status: 'pending' | 'completed' | 'failed';
  payment_method?: string;
  reference?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  type: string;
  budget_limit: number;
  budget_period: string;
}

export type TransactionType = 'INCOME' | 'EXPENSE';

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

export interface PaymentAssignmentResult {
  success: boolean;
  agreementNumber: string;
  amountAssigned: number;
  timestamp: string;
}
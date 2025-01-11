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
  Transaction_ID: string;
  Agreement_Number: string;
  Customer_Name: string;
  License_Plate: string;
  Amount: number;
  Payment_Method: string;
  Description: string;
  Payment_Date: string;
  Type: string;
  Status: string;
  is_valid?: boolean;
  error_description?: string;
}

export interface PaymentAssignmentResult {
  success: boolean;
  agreementNumber: string;
  amountAssigned: number;
  timestamp: string;
}
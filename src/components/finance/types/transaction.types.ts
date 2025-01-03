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

export interface RawPaymentImport {
  id: string;
  Agreement_Number: string;
  Transaction_ID: string;
  Customer_Name: string;
  License_Plate: string;
  Amount: number;
  Payment_Method: string;
  Description: string;
  Payment_Date: string;
  Type: string;
  Status: string;
  is_valid: boolean;
  error_description?: string;
  created_at: string;
}

export interface TransactionFormData {
  type: TransactionType;
  amount: number;
  category_id?: string;
  description: string;
  transaction_date: string;
  receipt?: FileList;
  paymentMethod?: string;
}
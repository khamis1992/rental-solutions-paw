export interface Transaction {
  id: string;
  amount: number;
  description: string;
  transaction_date: string;
  category: string;
  type: 'income' | 'expense';
  status: 'pending' | 'completed' | 'failed';
  payment_method?: string;
  reference?: string;
  created_at?: string;
  updated_at?: string;
}

export interface RawPaymentImport {
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
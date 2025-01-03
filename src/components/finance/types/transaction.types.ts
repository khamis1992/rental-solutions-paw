import { Json } from "@/integrations/supabase/types";

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
  category?: {
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
  is_valid: boolean;
  error_description?: string;
}

export interface PaymentImportData {
  lease_id: string;
  amount: number;
  payment_date: string;
  payment_method: PaymentMethodType;
  status: PaymentStatus;
  description?: string;
  transaction_id?: string;
}

export type PaymentMethodType = 'Invoice' | 'Cash' | 'WireTransfer' | 'Cheque' | 'Deposit' | 'On_hold';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface PaymentAnalysisResult {
  success: boolean;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  totalAmount: number;
  rawData: PaymentImportData[];
  issues?: string[];
  suggestions?: string[];
}
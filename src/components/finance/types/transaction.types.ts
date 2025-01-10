export type PaymentMethodType = 'Cash' | 'WireTransfer' | 'Cheque' | 'Invoice' | 'Deposit' | 'On_hold';

export type PaymentCategoryType = 
  | 'LATE PAYMENT FEE'
  | 'Administrative Fees'
  | 'Vehicle Damage Charge'
  | 'Traffic Fine'
  | 'RENTAL FEE'
  | 'Advance Payment'
  | 'other';

export interface Category {
  id: string;
  name: string;
  type: string;
  budget_limit: number;
  budget_period: string;
  description?: string;
}

export interface Transaction {
  id: string;
  type: "INCOME" | "EXPENSE";
  amount: number;
  description: string;
  transaction_date: string;
  category_id?: string;
  category: Category;
  receipt_url?: string;
  created_at: string;
  updated_at: string;
  payment_method: PaymentMethodType;
  status: string;
}

export interface TransactionFormData {
  amount: number;
  description: string;
  category_id: string;
  payment_method: PaymentMethodType;
  transaction_date: string;
  type: "INCOME" | "EXPENSE";
}

export interface RawPaymentImport {
  id?: string;
  Agreement_Number?: string;
  Transaction_ID?: string;
  Customer_Name?: string;
  License_Plate?: string;
  Amount?: number;
  Payment_Method?: string;
  Description?: string;
  Payment_Date?: string;
  Type?: string;
  Status?: string;
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
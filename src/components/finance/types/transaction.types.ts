import { PaymentMethodType } from "@/types/database/payment.types";

export interface Transaction {
  id: string;
  type: string;
  amount: number;
  category_id?: string;
  description?: string;
  transaction_date: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface TransactionFormData {
  type: string;
  amount: number;
  category_id?: string;
  description?: string;
  transaction_date: string;
  cost_type?: string;
  is_recurring?: boolean;
  payment_method?: PaymentMethodType;
  interval_value?: number;
  interval_unit?: string;
}

export interface RawPaymentImport {
  id: string;
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
}

export interface PaymentAssignmentResult {
  success: boolean;
  agreementNumber: string;
  amountAssigned: number;
  timestamp: string;
}
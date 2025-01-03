import { Json } from '@/integrations/supabase/types';

export type PaymentMethodType = 'Invoice' | 'Cash' | 'WireTransfer' | 'Cheque' | 'Deposit' | 'On_hold';

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
  budget_period?: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
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

export interface RawPaymentImport {
  id: string;
  Agreement_Number: string;
  Transaction_ID: string;
  Customer_Name: string;
  License_Plate: string;
  Amount: number;
  Payment_Method: PaymentMethodType;
  Description: string;
  Payment_Date: string;
  Type: string;
  Status: string;
  is_valid: boolean;
  error_description?: string;
  created_at: string;
}

export interface PaymentAssignmentResult {
  success: boolean;
  agreementNumber: string;
  amountAssigned: number;
  timestamp: string;
}

export interface TransactionFormData {
  amount: number;
  description: string;
  category_id: string;
  payment_method: PaymentMethodType;
  transaction_date: string;
  type: TransactionType;
}

export enum TransactionType {
  LATE_PAYMENT_FEE = 'LATE_PAYMENT_FEE',
  ADMINISTRATIVE_FEES = 'ADMINISTRATIVE_FEES',
  VEHICLE_DAMAGE_CHARGE = 'VEHICLE_DAMAGE_CHARGE',
  TRAFFIC_FINE = 'TRAFFIC_FINE',
  RENTAL_FEE = 'RENTAL_FEE',
  ADVANCE_PAYMENT = 'ADVANCE_PAYMENT',
  OTHER = 'OTHER',
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

export interface ImportErrors {
  skipped: Array<{
    row: number;
    data: Record<string, any>;
    reason: string;
  }>;
  failed: Array<{
    row: number;
    data?: Record<string, any>;
    error: string;
  }>;
}

export interface ImportLog {
  status: string;
  records_processed: number;
  errors: Json;
}
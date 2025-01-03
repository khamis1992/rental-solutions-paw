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

export type PaymentMethodType = 'Invoice' | 'Cash' | 'WireTransfer' | 'Cheque' | 'Deposit' | 'On_hold';

export type PaymentCategoryType = 
  | 'LATE PAYMENT FEE'
  | 'Administrative Fees'
  | 'Vehicle Damage Charge'
  | 'Traffic Fine'
  | 'RENTAL FEE'
  | 'Advance Payment'
  | 'other';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: {
    id: string;
    name: string;
    type: string;
    budget_limit: number;
    budget_period: string;
  };
  category_id?: string;
  description: string;
  transaction_date: string;
  payment_method?: PaymentMethodType;
  agreement_number?: string;
  customer_name?: string;
  license_plate?: string;
  receipt_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TransactionFormData {
  type: TransactionType;
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

export interface RawPaymentImport {
  id?: string;
  Agreement_Number: string | null;
  Transaction_ID: string | null;
  Customer_Name: string | null;
  License_Plate: string | null;
  Amount: number;
  Payment_Method: string | null;
  Description: string | null;
  Payment_Date: string | null;
  Type: string | null;
  Status: string | null;
  is_valid: boolean;
  error_description?: string | null;
  created_at?: string | null;
}
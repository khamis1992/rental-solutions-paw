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

export interface AccountingTransaction {
  id: string;
  Transaction_ID: string;
  Agreemgent_Number: string;
  Customer_Name: string;
  License_Plate: string;
  Amount: string;
  Payment_Method: string;
  Description: string;
  Payment_Date: string;
  Type: string;
  Status: string;
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
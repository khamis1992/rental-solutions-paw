export type TransactionType = 
  | 'LATE_PAYMENT_FEE'
  | 'ADMINISTRATIVE_FEES'
  | 'VEHICLE_DAMAGE_CHARGE'
  | 'TRAFFIC_FINE'
  | 'RENTAL_FEE'
  | 'ADVANCE_PAYMENT'
  | 'OTHER'
  | 'INCOME'
  | 'EXPENSE';

export type PaymentMethodType = 'Invoice' | 'Cash' | 'WireTransfer' | 'Cheque' | 'Deposit' | 'On_hold';

export type PaymentCategoryType = 
  | 'LATE PAYMENT FEE'
  | 'Administrative Fees'
  | 'Vehicle Damage Charge'
  | 'Traffic Fine'
  | 'RENTAL FEE'
  | 'Advance Payment'
  | 'other';

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
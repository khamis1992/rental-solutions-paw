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

export interface AccountingTransaction {
  id: string;
  transaction_id: string | null;
  agreement_number: string | null;
  customer_name: string | null;
  license_plate: string | null;
  amount: string | null;
  payment_method: string | null;
  description: string | null;
  transaction_date: string | null;
  type: string | null;
  status: string | null;
  category_id: string | null;
  receipt_url: string | null;
  created_at: string | null;
  updated_at: string | null;
  category?: {
    id: string;
    name: string;
    type: string;
  };
}

export interface Transaction {
  id: string;
  amount: string;
  type: TransactionType;
  category: {
    id: string;
    name: string;
    type: string;
  };
  transaction_date: string;
}
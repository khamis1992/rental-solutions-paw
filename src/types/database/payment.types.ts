export type PaymentMethodType = 'Cash' | 'WireTransfer' | 'Invoice' | 'On_hold' | 'Deposit' | 'Cheque';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled';

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
}

export interface Payment {
  id: string;
  lease_id: string;
  amount: number;
  amount_paid: number;
  balance: number;
  payment_date: string;
  due_date?: string;
  transaction_id?: string;
  payment_method: PaymentMethodType;
  status: PaymentStatus;
  description?: string;
  type: string;
  is_recurring: boolean;
  recurring_interval: string;
  next_payment_date?: string;
  late_fine_amount: number;
  days_overdue: number;
  include_in_calculation: boolean;
  invoice_id?: string;
  security_deposit_id?: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentFormData {
  amount: number;
  amountPaid: number;
  paymentMethod: PaymentMethodType;
  description?: string;
  paymentDate?: string;
  isRecurring: boolean;
  recurringInterval?: string;
}
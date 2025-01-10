export type PaymentMethodType = 'Cash' | 'Invoice' | 'WireTransfer' | 'Cheque' | 'Deposit' | 'On_hold';

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded';

export interface PaymentFormData {
  amount: number;
  amountPaid: number;
  paymentMethod: PaymentMethodType;
  description: string;
  isRecurring: boolean;
  recurringInterval: string;
  paymentDate?: string;
}

export interface PaymentRequest {
  leaseId: string;
  amount: number;
  paymentMethod: PaymentMethodType;
  description?: string;
  type: string;
  paymentDate?: string;
}

export interface Payment {
  id: string;
  lease_id: string;
  amount: number;
  amount_paid: number;
  balance: number;
  status: PaymentStatus;
  payment_date?: string;
  payment_method?: PaymentMethodType;
  description?: string;
  type: string;
  created_at: string;
  updated_at: string;
  transaction_id?: string;
  is_recurring?: boolean;
  recurring_interval?: string;
  next_payment_date?: string;
  late_fine_amount?: number;
  days_overdue?: number;
  include_in_calculation?: boolean;
  invoice_id?: string;
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
export interface Transaction {
  id: string;
  amount: number;
  description: string;
  transaction_date: string;
  type: TransactionType;
  status: TransactionStatus;
  category: Category;
  payment_method?: PaymentMethodType;
  reference?: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  type: string;
  budget_limit: number;
  budget_period: string;
}

export type TransactionType = 'INCOME' | 'EXPENSE';
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type PaymentMethodType = 'Invoice' | 'Cash' | 'WireTransfer' | 'Cheque' | 'Deposit' | 'On_hold';

export interface UnifiedImportTracking {
  id: string;
  transaction_id: string;
  agreement_number: string;
  customer_name: string;
  license_plate: string;
  amount: number;
  payment_method: PaymentMethodType;
  description: string;
  payment_date: string;
  type: string;
  status: 'pending' | 'completed' | 'failed';
  validation_status: boolean;
  processing_attempts: number;
  error_details?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PaymentAssignmentResult {
  success: boolean;
  agreementNumber: string;
  amountAssigned: number;
  timestamp: string;
}

export const REQUIRED_FIELDS = [
  'transaction_id',
  'agreement_number',
  'customer_name',
  'license_plate',
  'amount',
  'payment_method',
  'description',
  'payment_date',
  'type',
  'status'
];

export function validateHeaders(headers: string[]): { isValid: boolean; missingFields: string[] } {
  const missingFields = REQUIRED_FIELDS.filter(field => !headers.includes(field));
  return {
    isValid: missingFields.length === 0,
    missingFields
  };
}
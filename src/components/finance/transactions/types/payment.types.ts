export interface PaymentImportData {
  lease_id: string;
  amount: number;
  payment_date: string;
  payment_method: PaymentMethodType;
  status: PaymentStatus;
  description?: string;
  transaction_id?: string;
}

export type PaymentMethodType = 'Invoice' | 'Cash' | 'WireTransfer' | 'Cheque' | 'Deposit' | 'On_hold';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface PaymentAnalysisResult {
  success: boolean;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  totalAmount: number;
  rawData: PaymentImportData[];
  issues?: string[];
  suggestions?: string[];
}
export interface Transaction {
  id: string;
  amount: number;
  description: string;
  transaction_date: string;
  type: 'income' | 'expense';
  status: string;
  category_id?: string;
}

export interface RawPaymentImport {
  id: string;
  transaction_id: string;
  agreement_number: string;
  customer_name: string;
  license_plate: string;
  amount: number;
  payment_method: string;
  description: string;
  payment_date: string;
  type: string;
  status: string;
  is_valid: boolean;
  error_description?: string;
  created_at?: string;
}

export interface UnifiedImportTracking {
  id: string;
  file_name?: string;
  original_file_name?: string;
  batch_id?: string;
  import_source?: 'csv' | 'manual' | 'api' | 'bulk_upload';
  transaction_id: string;
  agreement_number: string;
  customer_name: string;
  license_plate: string;
  amount: number;
  payment_method: string;
  description: string;
  payment_date: string;
  type: string;
  status: 'pending' | 'completed' | 'failed';
  validation_status: boolean;
  validation_errors?: Record<string, any>;
  processing_attempts: number;
  last_processed_at?: string;
  matched_payment_id?: string;
  matched_agreement_id?: string;
  match_confidence?: number;
  error_details?: string;
  resolution_notes?: string;
  processed_by?: string;
  created_at?: string;
  updated_at?: string;
  row_number?: number;
}

export interface PaymentAssignmentResult {
  success: boolean;
  agreementNumber: string;
  amountAssigned: number;
  timestamp: string;
}
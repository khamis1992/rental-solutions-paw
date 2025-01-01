export interface PaymentData {
  lease_id: string;
  amount: number;
  payment_date: string;
  payment_method?: string;
  status?: string;
  description?: string;
  transaction_id?: string;
}

export interface PaymentAnalysis {
  success: boolean;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  totalAmount: number;
  rawData: PaymentData[];
  issues?: string[];
  suggestions?: string[];
}

export interface RequestPayload {
  analysisResult: PaymentAnalysis;
}

export interface ProcessingResult {
  success: boolean;
  payment: PaymentData;
  error?: string;
}
import { Json } from "@/integrations/supabase/types";

export interface ImportedPaymentData {
  Amount: number;
  Payment_Date: string;
  Payment_Method: PaymentMethodType;
  Status: PaymentStatus;
  Description?: string;
  Transaction_ID: string;
  Lease_ID: string;
}

export interface PaymentAnalysisResult {
  success: boolean;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  totalAmount: number;
  issues: string[];
  suggestions: string[];
  rawData: ImportedPaymentData[];
}

export interface ValidationResult {
  isValid: boolean;
  missingFields: string[];
}

export interface ProcessingResult {
  success: boolean;
  payment: ImportedPaymentData;
  error?: string;
}

export type PaymentMethodType = 'Invoice' | 'Cash' | 'WireTransfer' | 'Cheque' | 'Deposit' | 'On_hold';
export type PaymentStatus = 'pending' | 'completed' | 'failed';

export interface RawPaymentImport {
  raw_data: Json;
  is_valid: boolean;
  created_at: string;
  error_description?: string;
}
export interface PaymentData {
  Amount: string;
  Payment_Date: string;
  Payment_Method: string;
  Status: string;
  Description: string;
  Transaction_ID: string;
  Lease_ID: string;
}

export interface RepairResult {
  repairedData: PaymentData;
  repairs: string[];
  isValid: boolean;
  errors: string[];
}

export interface AnalysisResult {
  success: boolean;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  totalAmount: number;
  issues: string[];
  suggestions: string[];
  repairedData: PaymentData[];
}
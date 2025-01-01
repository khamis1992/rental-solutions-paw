import { corsHeaders } from './corsHeaders';

export interface PaymentData {
  analysisResult: {
    rawData: any[];
    success: boolean;
    fileName: string;
    processedFileUrl: string;
  };
}

export const validatePaymentData = (data: any): data is PaymentData => {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid request body format');
  }

  if (!data.analysisResult || typeof data.analysisResult !== 'object') {
    throw new Error('Missing or invalid analysis result');
  }

  if (!Array.isArray(data.analysisResult.rawData)) {
    throw new Error('Invalid or missing raw data array');
  }

  return true;
};

export const validatePaymentRow = (row: any) => {
  if (!row.amount || isNaN(Number(row.amount))) {
    throw new Error(`Invalid amount: ${row.amount}`);
  }

  if (!row.payment_date) {
    throw new Error('Missing payment date');
  }

  if (!row.payment_method) {
    throw new Error('Missing payment method');
  }

  return true;
};
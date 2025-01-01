import { corsHeaders } from './corsHeaders';

export interface PaymentData {
  fileName: string;
  processedFileUrl: string;
  analysisResult: {
    rawData: any[];
    success: boolean;
    totalRows: number;
    validRows: number;
    invalidRows: number;
    totalAmount: number;
    issues?: string[];
    suggestions?: string[];
  };
}

export const validatePaymentData = (data: any): data is PaymentData => {
  console.log('Validating payment data:', data);

  if (!data || typeof data !== 'object') {
    throw new Error('Invalid request body format');
  }

  if (!data.analysisResult || typeof data.analysisResult !== 'object') {
    throw new Error('Missing or invalid analysis result');
  }

  if (!Array.isArray(data.analysisResult.rawData)) {
    throw new Error('Analysis result must contain rawData array');
  }

  // Validate required fields
  const requiredFields = ['fileName', 'processedFileUrl', 'analysisResult'];
  const missingFields = requiredFields.filter(field => !data[field]);
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }

  // Validate analysis result structure
  const requiredAnalysisFields = ['success', 'totalRows', 'validRows', 'invalidRows', 'totalAmount'];
  const missingAnalysisFields = requiredAnalysisFields.filter(field => 
    data.analysisResult[field] === undefined
  );

  if (missingAnalysisFields.length > 0) {
    throw new Error(`Missing analysis result fields: ${missingAnalysisFields.join(', ')}`);
  }

  return true;
};

export const validatePaymentRow = (row: any) => {
  console.log('Validating payment row:', row);

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
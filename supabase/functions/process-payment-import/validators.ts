import { PaymentAnalysis, PaymentData } from './types.ts';

export const validateAnalysisResult = (data: any): data is PaymentAnalysis => {
  try {
    console.log('Starting validation of analysis result');
    
    if (!data) {
      console.error('Analysis result is null or undefined');
      return false;
    }

    if (typeof data !== 'object') {
      console.error('Analysis result is not an object, type:', typeof data);
      return false;
    }

    console.log('Analysis result structure:', Object.keys(data));

    const requiredFields = ['success', 'totalRows', 'validRows', 'invalidRows', 'totalAmount', 'rawData'];
    const missingFields = requiredFields.filter(field => {
      const hasField = data[field] !== undefined && data[field] !== null;
      if (!hasField) {
        console.error(`Missing or invalid field: ${field}, value:`, data[field]);
      }
      return !hasField;
    });
    
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      return false;
    }

    if (!Array.isArray(data.rawData)) {
      console.error('rawData is not an array, type:', typeof data.rawData);
      return false;
    }

    console.log('Validation successful');
    return true;
  } catch (error) {
    console.error('Validation error:', error);
    return false;
  }
};

export const validatePaymentData = (payment: PaymentData): boolean => {
  if (!payment.lease_id || !payment.amount || !payment.payment_date) {
    console.error('Invalid payment data:', { payment });
    return false;
  }
  return true;
};
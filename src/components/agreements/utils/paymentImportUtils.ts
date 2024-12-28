import { parseCSV } from './csvUtils';

interface PaymentRow {
  Agreement_Number?: string;
  Amount?: string;
  Payment_Date?: string;
  Payment_Method?: string;
  Status?: string;
  Description?: string;
  Transaction_ID?: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  data?: any;
}

export const validatePaymentRow = (row: PaymentRow): ValidationResult => {
  const errors: string[] = [];

  // Check required fields
  if (!row.Agreement_Number) {
    errors.push('Agreement Number is required');
  }
  if (!row.Amount) {
    errors.push('Amount is required');
  }
  if (!row.Payment_Date) {
    errors.push('Payment Date is required');
  }

  // Validate amount format
  if (row.Amount && isNaN(parseFloat(row.Amount))) {
    errors.push('Amount must be a valid number');
  }

  // Validate date format
  if (row.Payment_Date) {
    const date = new Date(row.Payment_Date);
    if (isNaN(date.getTime())) {
      errors.push('Payment Date must be in a valid date format (YYYY-MM-DD)');
    }
  }

  // Validate payment method if provided
  const validPaymentMethods = ['Cash', 'WireTransfer', 'Invoice', 'On_hold', 'Deposit', 'Cheque'];
  if (row.Payment_Method && !validPaymentMethods.includes(row.Payment_Method)) {
    errors.push(`Invalid Payment Method. Must be one of: ${validPaymentMethods.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: errors.length === 0 ? {
      agreement_number: row.Agreement_Number,
      amount: parseFloat(row.Amount || '0'),
      payment_date: new Date(row.Payment_Date || '').toISOString(),
      payment_method: row.Payment_Method || 'Invoice',
      status: row.Status || 'pending',
      description: row.Description || '',
      transaction_id: row.Transaction_ID || null
    } : undefined
  };
};

export const validateAndMapCSVContent = (content: string): ValidationResult => {
  try {
    const rows = parseCSV(content);
    const validatedRows: any[] = [];
    const errors: string[] = [];

    rows.forEach((row, index) => {
      const validation = validatePaymentRow(row);
      if (validation.isValid && validation.data) {
        validatedRows.push(validation.data);
      } else {
        errors.push(`Row ${index + 1}: ${validation.errors.join(', ')}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      data: validatedRows
    };
  } catch (error) {
    return {
      isValid: false,
      errors: ['Failed to parse CSV file: ' + (error instanceof Error ? error.message : 'Unknown error')]
    };
  }
};
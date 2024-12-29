export const requiredHeaders = [
  'Amount',
  'Payment_Date',
  'Payment_Method',
  'Status',
  'Description',
  'Transaction_ID',
  'Lease_ID'
];

export interface ValidationResult {
  isValid: boolean;
  errors: Array<{
    row: number;
    message: string;
    data?: any;
  }>;
}

export const validateCSVStructure = (headers: string[]): { 
  isValid: boolean; 
  missingHeaders: string[];
} => {
  const normalizedHeaders = headers.map(h => h.trim());
  const missingHeaders = requiredHeaders.filter(
    required => !normalizedHeaders.includes(required)
  );
  
  return {
    isValid: missingHeaders.length === 0,
    missingHeaders
  };
};

export const validateRow = (
  row: string[], 
  headers: string[], 
  rowIndex: number
): ValidationResult => {
  const errors = [];
  const rowData: Record<string, string> = {};

  // Map row values to headers
  headers.forEach((header, index) => {
    rowData[header.trim()] = row[index]?.trim() || '';
  });

  // Validate Amount
  if (!rowData.Amount || isNaN(Number(rowData.Amount))) {
    errors.push({
      row: rowIndex,
      message: 'Invalid amount value',
      data: rowData.Amount
    });
  }

  // Validate Payment_Date
  const dateRegex = /^\d{2}-\d{2}-\d{4}$/;
  if (!rowData.Payment_Date || !dateRegex.test(rowData.Payment_Date)) {
    errors.push({
      row: rowIndex,
      message: 'Invalid date format. Expected DD-MM-YYYY',
      data: rowData.Payment_Date
    });
  }

  // Validate required fields
  requiredHeaders.forEach(header => {
    if (!rowData[header]) {
      errors.push({
        row: rowIndex,
        message: `Missing required field: ${header}`,
        data: rowData
      });
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};
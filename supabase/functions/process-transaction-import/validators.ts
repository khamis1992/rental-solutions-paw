export const VALID_STATUSES = ['pending', 'completed', 'failed', 'refunded'] as const;
export type ValidStatus = typeof VALID_STATUSES[number];

export interface ValidationError {
  row: number;
  field: string;
  message: string;
  data?: any;
}

export const validateStatus = (status: string): boolean => {
  return VALID_STATUSES.includes(status.toLowerCase() as ValidStatus);
};

export const validateAmount = (amount: string | number): boolean => {
  const numAmount = Number(amount);
  return !isNaN(numAmount) && numAmount > 0;
};

export const validateCSVHeaders = (headers: string[]) => {
  const requiredHeaders = [
    'Lease_ID',
    'Customer_Name',
    'Amount',
    'License_Plate',
    'Vehicle',
    'Payment_Date',
    'Payment_Method',
    'Transaction_ID',
    'Description',
    'Type',
    'Status'
  ];

  const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
  return {
    isValid: missingHeaders.length === 0,
    missingHeaders
  };
};

export const validateRow = (rowData: Record<string, string>, rowIndex: number): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Validate Status
  if (!rowData.Status || !validateStatus(rowData.Status)) {
    errors.push({
      row: rowIndex,
      field: 'Status',
      message: `Invalid status value. Must be one of: ${VALID_STATUSES.join(', ')}`,
      data: rowData.Status
    });
  }

  // Validate Amount
  if (!rowData.Amount || !validateAmount(rowData.Amount)) {
    errors.push({
      row: rowIndex,
      field: 'Amount',
      message: 'Amount must be a positive number',
      data: rowData.Amount
    });
  }

  return errors;
};
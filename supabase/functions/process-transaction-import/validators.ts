export const validateCSVStructure = (headers: string[]) => {
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

  const missingHeaders = requiredHeaders.filter(
    header => !headers.includes(header)
  );

  return {
    isValid: missingHeaders.length === 0,
    missingHeaders,
    headers
  };
};

export const validateRow = (values: string[], headers: string[], rowIndex: number) => {
  const errors = [];
  const rowData: Record<string, string> = {};

  // Map values to headers
  headers.forEach((header, index) => {
    rowData[header] = values[index]?.trim() || '';
  });

  // Required field validations
  if (!rowData.Amount || isNaN(Number(rowData.Amount))) {
    errors.push({
      row: rowIndex,
      field: 'Amount',
      message: 'Amount must be a valid number'
    });
  }

  if (!rowData.Payment_Date || !isValidDate(rowData.Payment_Date)) {
    errors.push({
      row: rowIndex,
      field: 'Payment_Date',
      message: 'Payment_Date must be a valid date'
    });
  }

  if (!rowData.Status || !isValidStatus(rowData.Status)) {
    errors.push({
      row: rowIndex,
      field: 'Status',
      message: 'Status must be one of: pending, completed, failed, refunded'
    });
  }

  if (!rowData.Lease_ID) {
    errors.push({
      row: rowIndex,
      field: 'Lease_ID',
      message: 'Lease_ID is required'
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: rowData
  };
};

const isValidDate = (dateStr: string): boolean => {
  const date = new Date(dateStr);
  return date instanceof Date && !isNaN(date.getTime());
};

const isValidStatus = (status: string): boolean => {
  const validStatuses = ['pending', 'completed', 'failed', 'refunded'];
  return validStatuses.includes(status.toLowerCase());
};
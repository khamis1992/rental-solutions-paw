import { format, parse } from 'date-fns';

export const REQUIRED_FIELDS = [
  'Transaction_ID',
  'Agreement_Number',
  'Customer_Name',
  'License_Plate',
  'Amount',
  'Payment_Method',
  'Description',
  'Payment_Date',
  'Type',
  'Status'
];

export const validateHeaders = (headers: string[]) => {
  const missingFields = REQUIRED_FIELDS.filter(field => !headers.includes(field));
  return {
    isValid: missingFields.length === 0,
    missingFields
  };
};

export const normalizePaymentMethod = (method: string): string => {
  const normalized = method.toLowerCase().trim();
  switch (normalized) {
    case 'cash':
    case 'card':
    case 'bank_transfer':
    case 'cheque':
      return normalized;
    default:
      return 'cash';
  }
};

export const formatDateForDB = (dateStr: string): string | null => {
  try {
    // First try parsing as DD-MM-YYYY
    const parsedDate = parse(dateStr, 'dd-MM-yyyy', new Date());
    if (isNaN(parsedDate.getTime())) {
      // If that fails, try DD/MM/YYYY
      const parsedDateSlash = parse(dateStr, 'dd/MM/yyyy', new Date());
      if (isNaN(parsedDateSlash.getTime())) {
        return null;
      }
      return format(parsedDateSlash, 'yyyy-MM-dd');
    }
    return format(parsedDate, 'yyyy-MM-dd');
  } catch (error) {
    console.error('Error formatting date:', error);
    return null;
  }
};
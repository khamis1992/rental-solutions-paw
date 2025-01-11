import { PaymentMethodType } from "@/types/database/payment.types";
import { format, parse, isValid } from "date-fns";

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
] as const;

export const validateHeaders = (headers: string[]): { isValid: boolean; missingFields: string[] } => {
  const normalizedHeaders = headers.map(h => h.trim());
  const missingFields = REQUIRED_FIELDS.filter(
    field => !normalizedHeaders.includes(field)
  );
  return {
    isValid: missingFields.length === 0,
    missingFields
  };
};

export const normalizePaymentMethod = (method: string): PaymentMethodType => {
  const methodMap: Record<string, PaymentMethodType> = {
    'cash': 'Cash',
    'invoice': 'Invoice',
    'wire': 'WireTransfer',
    'wiretransfer': 'WireTransfer',
    'wire_transfer': 'WireTransfer',
    'cheque': 'Cheque',
    'check': 'Cheque',
    'deposit': 'Deposit',
    'onhold': 'On_hold',
    'on_hold': 'On_hold',
    'on-hold': 'On_hold'
  };

  const normalized = method.toLowerCase().replace(/[^a-z_]/g, '');
  return methodMap[normalized] || 'Cash';
};

export const formatDateForDB = (dateStr: string): string | null => {
  try {
    // Try parsing DD-MM-YYYY format
    const parsedDate = parse(dateStr.replace(/\//g, '-'), 'dd-MM-yyyy', new Date());
    
    if (isValid(parsedDate)) {
      return format(parsedDate, 'yyyy-MM-dd');
    }

    // Try parsing DD/MM/YYYY format
    const parsedDateSlash = parse(dateStr, 'dd/MM/yyyy', new Date());
    if (isValid(parsedDateSlash)) {
      return format(parsedDateSlash, 'yyyy-MM-dd');
    }

    // If already in YYYY-MM-DD format, validate and return
    const isoDate = new Date(dateStr);
    if (isValid(isoDate)) {
      return format(isoDate, 'yyyy-MM-dd');
    }

    console.error('Invalid date format:', dateStr);
    return null;
  } catch (error) {
    console.error('Error parsing date:', dateStr, error);
    return null;
  }
};
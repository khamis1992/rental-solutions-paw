import { PaymentMethodType } from "@/components/finance/types/transaction.types";

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
import { PaymentData } from './types';
import { repairDate, repairAmount, repairPaymentMethod, repairStatus } from './dataRepair';

export const validateAndRepairRow = (
  row: Record<string, string>, 
  rowIndex: number
): { 
  isValid: boolean; 
  repairs: string[]; 
  errors: string[]; 
  repairedData: PaymentData 
} => {
  const repairs: string[] = [];
  const errors: string[] = [];
  const repairedData = { ...row } as PaymentData;

  // Repair Amount
  const amountRepair = repairAmount(row.Amount);
  if (amountRepair.wasRepaired) {
    repairs.push(`Row ${rowIndex + 1}: Amount format was fixed`);
    repairedData.Amount = amountRepair.value;
  }
  if (amountRepair.error) {
    errors.push(`Row ${rowIndex + 1}: ${amountRepair.error}`);
  }

  // Repair Payment Date
  const dateRepair = repairDate(row.Payment_Date);
  if (dateRepair.wasRepaired) {
    repairs.push(`Row ${rowIndex + 1}: Date format was converted to DD-MM-YYYY`);
    repairedData.Payment_Date = dateRepair.value;
  }
  if (dateRepair.error) {
    errors.push(`Row ${rowIndex + 1}: ${dateRepair.error}`);
  }

  // Repair Payment Method
  const methodRepair = repairPaymentMethod(row.Payment_Method);
  if (methodRepair.wasRepaired) {
    repairs.push(`Row ${rowIndex + 1}: Payment method was standardized`);
    repairedData.Payment_Method = methodRepair.value;
  }

  // Repair Status
  const statusRepair = repairStatus(row.Status);
  if (statusRepair.wasRepaired) {
    repairs.push(`Row ${rowIndex + 1}: Status was standardized`);
    repairedData.Status = statusRepair.value;
  }

  // Validate required fields
  ['Amount', 'Payment_Date', 'Payment_Method', 'Status', 'Transaction_ID', 'Lease_ID'].forEach(field => {
    if (!repairedData[field as keyof PaymentData]) {
      errors.push(`Row ${rowIndex + 1}: Missing required field "${field}"`);
    }
  });

  return {
    isValid: errors.length === 0,
    repairs,
    errors,
    repairedData
  };
};
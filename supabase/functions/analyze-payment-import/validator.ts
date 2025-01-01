interface RepairResult {
  isValid: boolean;
  repairs: string[];
  errors: string[];
  repairedData: any;
}

const repairDate = (value: string, rowIndex: number): { value: string; repair?: string; error?: string } => {
  const cleanValue = value.trim().replace(/['"]/g, '');
  
  // Try different date formats
  const formats = [
    { regex: /^(\d{2})-(\d{2})-(\d{4})$/, format: 'DD-MM-YYYY' },
    { regex: /^(\d{4})-(\d{2})-(\d{2})$/, format: 'YYYY-MM-DD' },
    { regex: /^(\d{2})\/(\d{2})\/(\d{4})$/, format: 'DD/MM/YYYY' }
  ];

  for (const { regex, format } of formats) {
    const match = cleanValue.match(regex);
    if (match) {
      let [_, part1, part2, part3] = match;
      
      // Convert to DD-MM-YYYY format
      if (format === 'YYYY-MM-DD') {
        [part1, part2, part3] = [part3, part2, part1];
      }
      
      const repairedDate = `${part1}-${part2}-${part3}`;
      return { 
        value: repairedDate,
        repair: format !== 'DD-MM-YYYY' ? `Row ${rowIndex + 1}: Date format converted from ${format} to DD-MM-YYYY` : undefined
      };
    }
  }

  return { 
    value: cleanValue,
    error: `Row ${rowIndex + 1}: Invalid date format. Expected DD-MM-YYYY`
  };
};

const repairAmount = (value: string, rowIndex: number): { value: string; repair?: string; error?: string } => {
  // Remove currency symbols, spaces, and other non-numeric characters except decimal point
  const cleanValue = value.trim().replace(/[^0-9.-]/g, '');
  
  if (isNaN(parseFloat(cleanValue))) {
    return {
      value: cleanValue,
      error: `Row ${rowIndex + 1}: Invalid amount format`
    };
  }

  if (cleanValue !== value.trim()) {
    return {
      value: cleanValue,
      repair: `Row ${rowIndex + 1}: Amount format cleaned from "${value}" to "${cleanValue}"`
    };
  }

  return { value: cleanValue };
};

const repairPaymentMethod = (value: string, rowIndex: number): { value: string; repair?: string } => {
  const cleanValue = value.trim().toLowerCase();
  const standardMethods: Record<string, string> = {
    'credit': 'credit_card',
    'credit card': 'credit_card',
    'creditcard': 'credit_card',
    'wire': 'wire_transfer',
    'wiretransfer': 'wire_transfer',
    'bank transfer': 'wire_transfer',
    'cash': 'cash',
    'cheque': 'cheque',
    'check': 'cheque'
  };

  const standardized = standardMethods[cleanValue] || cleanValue;
  
  if (standardized !== value) {
    return {
      value: standardized,
      repair: `Row ${rowIndex + 1}: Payment method standardized from "${value}" to "${standardized}"`
    };
  }

  return { value: standardized };
};

export const validateAndRepairRow = (row: Record<string, string>, rowIndex: number): RepairResult => {
  const repairs: string[] = [];
  const errors: string[] = [];
  const repairedData: Record<string, any> = {};

  // Repair Amount
  const amountRepair = repairAmount(row.Amount, rowIndex);
  repairedData.Amount = amountRepair.value;
  if (amountRepair.repair) repairs.push(amountRepair.repair);
  if (amountRepair.error) errors.push(amountRepair.error);

  // Repair Payment Date
  const dateRepair = repairDate(row.Payment_Date, rowIndex);
  repairedData.Payment_Date = dateRepair.value;
  if (dateRepair.repair) repairs.push(dateRepair.repair);
  if (dateRepair.error) errors.push(dateRepair.error);

  // Repair Payment Method
  const methodRepair = repairPaymentMethod(row.Payment_Method, rowIndex);
  repairedData.Payment_Method = methodRepair.value;
  if (methodRepair.repair) repairs.push(methodRepair.repair);

  // Copy other fields
  repairedData.Status = row.Status || 'completed';
  repairedData.Description = row.Description;
  repairedData.Transaction_ID = row.Transaction_ID;
  repairedData.Lease_ID = row.Lease_ID;

  // Validate required fields
  ['Amount', 'Payment_Date', 'Payment_Method', 'Status', 'Transaction_ID', 'Lease_ID'].forEach(field => {
    if (!repairedData[field]) {
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
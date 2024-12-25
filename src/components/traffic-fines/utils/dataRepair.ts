import { validateDateFormat } from './csvParser';

interface RepairResult {
  value: string;
  wasRepaired: boolean;
  repairDetails?: string;
}

export const repairDate = (value: string): RepairResult => {
  // Try different date formats and normalize them
  const cleanValue = value.trim().replace(/['"]/g, '');
  
  // Check if it's already valid
  if (validateDateFormat(cleanValue)) {
    return { value: cleanValue, wasRepaired: false };
  }

  // Try DD/MM/YYYY format
  const ddmmyyyy = cleanValue.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (ddmmyyyy) {
    const [_, day, month, year] = ddmmyyyy;
    const repairedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    return {
      value: repairedDate,
      wasRepaired: true,
      repairDetails: `Converted from DD/MM/YYYY format`
    };
  }

  // Return original if can't repair
  return { value: cleanValue, wasRepaired: false };
};

export const repairNumeric = (value: string): RepairResult => {
  const cleanValue = value.trim().replace(/['"]/g, '');
  
  // Remove currency symbols and spaces
  const processed = cleanValue.replace(/[^0-9.-]/g, '');
  
  if (processed !== cleanValue) {
    return {
      value: processed,
      wasRepaired: true,
      repairDetails: 'Removed non-numeric characters'
    };
  }

  return { value: cleanValue, wasRepaired: false };
};

export const repairString = (value: string): RepairResult => {
  const cleanValue = value.trim().replace(/^["']|["']$/g, '');
  
  if (cleanValue !== value) {
    return {
      value: cleanValue,
      wasRepaired: true,
      repairDetails: 'Removed enclosing quotes'
    };
  }

  return { value: cleanValue, wasRepaired: false };
};

export const ensureColumnCount = (
  row: string[],
  expectedCount: number
): { row: string[]; repairs: string[] } => {
  const repairs: string[] = [];
  let repairedRow = [...row];

  // Add missing columns
  while (repairedRow.length < expectedCount) {
    repairs.push(`Added empty column at position ${repairedRow.length + 1}`);
    repairedRow.push('');
  }

  // Remove extra columns
  if (repairedRow.length > expectedCount) {
    repairs.push(`Removed ${repairedRow.length - expectedCount} extra columns`);
    repairedRow = repairedRow.slice(0, expectedCount);
  }

  return { row: repairedRow, repairs };
};
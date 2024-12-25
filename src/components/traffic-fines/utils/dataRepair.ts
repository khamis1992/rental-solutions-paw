import { format, isValid, parseISO } from 'date-fns';

interface RepairResult {
  value: string;
  wasRepaired: boolean;
  repairDetails?: string;
}

export const repairDate = (value: string): RepairResult => {
  const cleanValue = value.trim().replace(/['"]/g, '');
  
  try {
    // Try parsing as ISO date
    const date = parseISO(cleanValue);
    if (isValid(date)) {
      return { value: format(date, 'yyyy-MM-dd'), wasRepaired: false };
    }

    // Try DD/MM/YYYY format
    const parts = cleanValue.split(/[/-]/);
    if (parts.length === 3) {
      const [day, month, year] = parts;
      const repairedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      const parsedDate = parseISO(repairedDate);
      
      if (isValid(parsedDate)) {
        return {
          value: repairedDate,
          wasRepaired: true,
          repairDetails: 'Converted from DD/MM/YYYY format'
        };
      }
    }
    
    return { 
      value: cleanValue,
      wasRepaired: false,
      repairDetails: 'Invalid date format'
    };
  } catch (error) {
    console.error('Date repair error:', error);
    return { 
      value: cleanValue,
      wasRepaired: false,
      repairDetails: 'Date parsing error'
    };
  }
};

export const repairNumeric = (value: string): RepairResult => {
  const cleanValue = value.trim().replace(/['"]/g, '');
  
  // Remove any non-numeric characters except decimal point and minus
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

export const ensureColumnCount = (
  row: string[],
  expectedCount: number
): { row: string[]; repairs: string[] } => {
  const repairs: string[] = [];
  let repairedRow = [...row];

  // Add empty values for missing columns
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
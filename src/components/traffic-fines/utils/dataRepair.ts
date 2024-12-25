import { format, isValid, parseISO } from 'date-fns';

interface RepairResult {
  value: string;
  wasRepaired: boolean;
  repairDetails?: string;
  error?: {
    type: string;
    details: string;
  };
}

export const repairDate = (value: string): RepairResult => {
  const cleanValue = value.trim().replace(/['"]/g, '');
  
  try {
    // Try parsing as ISO date (YYYY-MM-DD)
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
      error: {
        type: 'invalid_date',
        details: 'Invalid date format'
      }
    };
  } catch (error) {
    console.error('Date repair error:', error);
    return { 
      value: cleanValue,
      wasRepaired: false,
      error: {
        type: 'date_parsing_error',
        details: 'Date parsing error'
      }
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
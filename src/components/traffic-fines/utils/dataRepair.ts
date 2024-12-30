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
    // Try DD/MM/YYYY format first since that's the expected format
    const parts = cleanValue.split(/[/-]/);
    if (parts.length === 3) {
      const day = parts[0].padStart(2, '0');
      const month = parts[1].padStart(2, '0');
      const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
      
      const repairedDate = `${year}-${month}-${day}`;
      const parsedDate = parseISO(repairedDate);
      
      if (isValid(parsedDate)) {
        return {
          value: repairedDate,
          wasRepaired: true,
          repairDetails: 'Converted from DD/MM/YYYY format'
        };
      }
    }

    // Fallback: Try parsing as ISO date (YYYY-MM-DD)
    const isoDate = parseISO(cleanValue);
    if (isValid(isoDate)) {
      return { 
        value: format(isoDate, 'yyyy-MM-dd'), 
        wasRepaired: false 
      };
    }
    
    return { 
      value: cleanValue,
      wasRepaired: false,
      error: {
        type: 'invalid_date',
        details: 'Invalid date format. Expected DD/MM/YYYY'
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
import { isValid, parseISO } from "date-fns";

export const parseCSVLine = (line: string): string[] => {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    
    if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
      continue;
    }
    
    current += char;
  }
  
  result.push(current.trim());
  return result.filter(Boolean); // Remove empty entries
};

export const validateDateFormat = (dateStr: string): boolean => {
  if (!dateStr) {
    console.error('Empty date string');
    return false;
  }

  const cleanDateStr = dateStr.replace(/"/g, '').trim();
  console.log('Validating date:', cleanDateStr);
  
  const parsedDate = parseISO(cleanDateStr);
  if (isValid(parsedDate)) {
    console.log('Valid ISO date');
    return true;
  }

  const date = new Date(cleanDateStr);
  const isValidDate = isValid(date);
  console.log('Valid regular date:', isValidDate);
  return isValidDate;
};

export const validateCSVHeaders = (headers: string[]): { isValid: boolean; missingHeaders: string[] } => {
  console.log('Validating headers:', headers);
  
  const requiredHeaders = [
    'serial_number',
    'violation_number',
    'violation_date',
    'license_plate',
    'fine_location',
    'violation_charge',
    'fine_amount',
    'violation_points'
  ];

  const normalizedHeaders = headers
    .map(h => h.toLowerCase().trim())
    .filter(Boolean); // Remove empty headers
  
  console.log('Normalized headers:', normalizedHeaders);
  
  const missingHeaders = requiredHeaders.filter(h => !normalizedHeaders.includes(h));
  
  return {
    isValid: missingHeaders.length === 0,
    missingHeaders
  };
};
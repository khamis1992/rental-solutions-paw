import { isValid, parseISO } from "date-fns";

export const parseCSVLine = (line: string): string[] => {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result.filter(Boolean); // Remove empty strings
};

export const validateDateFormat = (dateStr: string): boolean => {
  try {
    if (!dateStr) {
      console.error('Empty date string');
      return false;
    }

    // Remove any quotes and whitespace
    const cleanDateStr = dateStr.replace(/"/g, '').trim();
    
    // Try parsing as ISO date first
    const parsedDate = parseISO(cleanDateStr);
    if (isValid(parsedDate)) {
      return true;
    }

    // Try parsing as regular date
    const date = new Date(cleanDateStr);
    return isValid(date);
  } catch (error) {
    console.error('Date validation error:', error);
    return false;
  }
};

export const validateCSVHeaders = (headers: string[]): { isValid: boolean; missingHeaders: string[] } => {
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

  const normalizedHeaders = headers.map(h => h.toLowerCase().trim());
  const missingHeaders = requiredHeaders.filter(h => !normalizedHeaders.includes(h));

  return {
    isValid: missingHeaders.length === 0,
    missingHeaders
  };
};
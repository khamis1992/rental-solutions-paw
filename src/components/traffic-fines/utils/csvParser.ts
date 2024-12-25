import { isValid, parseISO } from "date-fns";

interface ParseResult {
  values: string[];
  repairs: string[];
}

export const parseCSVLine = (line: string): ParseResult => {
  const result: string[] = [];
  const repairs: string[] = [];
  let current = '';
  let inQuotes = false;
  let columnIndex = 0;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (char === '"') {
      if (!inQuotes) {
        inQuotes = true;
        if (current.length > 0) {
          repairs.push(`Fixed unescaped quote at column ${columnIndex}`);
        }
        continue;
      } else if (nextChar === '"') {
        current += '"';
        i++; // Skip next quote
        continue;
      } else {
        inQuotes = false;
        continue;
      }
    }
    
    if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
      columnIndex++;
      continue;
    }
    
    current += char;
  }
  
  // Add the last value
  result.push(current.trim());
  
  return { values: result, repairs };
};

export const validateDateFormat = (dateStr: string): boolean => {
  if (!dateStr) return false;

  const cleanDateStr = dateStr.replace(/"/g, '').trim();
  const parsedDate = parseISO(cleanDateStr);
  
  if (isValid(parsedDate)) {
    return true;
  }

  // Try parsing as regular date
  const date = new Date(cleanDateStr);
  return isValid(date);
};

export const validateHeaders = (headers: string[]): { isValid: boolean; missingHeaders: string[] } => {
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
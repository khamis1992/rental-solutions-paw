import { ParseResult } from './types';
import { repairQuotes, repairDelimiters } from './repairUtils';
import { repairDate } from './dataRepair';

export const parseCSVLine = (line: string): ParseResult => {
  // First repair any quote and delimiter issues
  const { value: repairedLine, repairs: quoteRepairs } = repairQuotes(line);
  const { value: finalLine, repairs: delimiterRepairs } = repairDelimiters(repairedLine);
  
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  let repairs = [...quoteRepairs, ...delimiterRepairs];
  
  // Handle empty line
  if (!finalLine.trim()) {
    return { values: [], repairs: ['Empty line skipped'] };
  }

  // Process each character
  for (let i = 0; i < finalLine.length; i++) {
    const char = finalLine[i];
    const nextChar = finalLine[i + 1];

    if (char === '"') {
      if (!inQuotes) {
        inQuotes = true;
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
      continue;
    }

    current += char;
  }

  // Add the last value
  result.push(current.trim());

  // Process dates in the result
  const processedResult = result.map((value, index) => {
    // Assuming the date is in the third column (index 2)
    if (index === 2) {
      const { value: processedDate, wasRepaired, repairDetails } = repairDate(value);
      if (wasRepaired && repairDetails) {
        repairs.push(repairDetails);
      }
      return processedDate;
    }
    return value;
  });

  return { values: processedResult, repairs };
};

export const validateHeaders = (headers: string[], requiredHeaders: string[]): { isValid: boolean; missingHeaders: string[] } => {
  const normalizedHeaders = headers.map(h => h.toLowerCase().trim());
  const missingHeaders = requiredHeaders.filter(h => !normalizedHeaders.includes(h));
  
  return {
    isValid: missingHeaders.length === 0,
    missingHeaders
  };
};
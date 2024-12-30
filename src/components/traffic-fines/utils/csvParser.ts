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

export const reconstructMalformedRow = (
  currentRow: string[],
  nextRow: string | undefined,
  expectedColumns: number
): { 
  repairedRow: string[]; 
  skipNextRow: boolean; 
  repairs: string[] 
} => {
  const repairs: string[] = [];
  let repairedRow = [...currentRow];
  let skipNextRow = false;

  // If we have fewer columns than expected and there's a next row
  if (currentRow.length < expectedColumns && nextRow) {
    console.log('Attempting to repair malformed row by merging with next row');
    // Check if the next row might be a continuation
    const nextRowParts = nextRow.split(',');
    const remaining = expectedColumns - currentRow.length;
    
    // Only take what we need from the next row
    const neededParts = nextRowParts.slice(0, remaining);
    repairedRow = [...currentRow, ...neededParts];
    
    repairs.push(`Merged split row due to line break. Added ${neededParts.length} values from next row`);
    skipNextRow = true;
  }

  // Ensure we have exactly the expected number of columns
  while (repairedRow.length < expectedColumns) {
    repairs.push(`Added empty placeholder for column ${repairedRow.length + 1}`);
    repairedRow.push('');
  }

  // Remove extra columns if we have too many
  if (repairedRow.length > expectedColumns) {
    const removedCount = repairedRow.length - expectedColumns;
    repairs.push(`Removed ${removedCount} extra columns`);
    repairedRow = repairedRow.slice(0, expectedColumns);
  }

  console.log('Row repair results:', {
    originalLength: currentRow.length,
    repairedLength: repairedRow.length,
    repairs,
    skipNextRow
  });

  return {
    repairedRow,
    skipNextRow,
    repairs
  };
};
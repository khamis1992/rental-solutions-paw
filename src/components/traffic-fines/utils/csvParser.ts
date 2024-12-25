import { ParseResult } from './types';

export const parseCSVLine = (line: string): ParseResult => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  let repairs: string[] = [];
  
  // Handle empty line
  if (!line.trim()) {
    return { values: [], repairs: ['Empty line skipped'] };
  }

  // Process each character
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

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

  return { values: result, repairs };
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
    // Check if the next row might be a continuation
    const nextRowParts = nextRow.split(',');
    const remaining = expectedColumns - currentRow.length;
    
    // Only take what we need from the next row
    const neededParts = nextRowParts.slice(0, remaining);
    repairedRow = [...currentRow, ...neededParts];
    
    repairs.push('Merged split row due to line break');
    skipNextRow = true;
  }

  // Ensure we have exactly the expected number of columns
  while (repairedRow.length < expectedColumns) {
    repairs.push(`Added empty placeholder for column ${repairedRow.length + 1}`);
    repairedRow.push('');
  }

  // Remove extra columns if we have too many
  if (repairedRow.length > expectedColumns) {
    repairs.push(`Removed ${repairedRow.length - expectedColumns} extra columns`);
    repairedRow = repairedRow.slice(0, expectedColumns);
  }

  return {
    repairedRow,
    skipNextRow,
    repairs
  };
};
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

  // Count quotes to detect unmatched quotes
  const quoteCount = (line.match(/"/g) || []).length;
  if (quoteCount % 2 !== 0) {
    line = line + '"';
    repairs.push('Added missing closing quote');
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

  // Normalize the number of columns to match the expected order
  const expectedColumns = 8;
  const columnNames = [
    'serial_number',
    'violation_number',
    'violation_date',
    'license_plate',
    'fine_location',
    'violation_charge',
    'fine_amount',
    'violation_points'
  ];
  
  // Add empty values for missing columns
  while (result.length < expectedColumns) {
    repairs.push(`Added empty placeholder for ${columnNames[result.length]}`);
    result.push('');
  }

  // Remove excess columns
  if (result.length > expectedColumns) {
    const removed = result.splice(expectedColumns);
    repairs.push(`Removed ${removed.length} excess columns`);
  }

  return { values: result, repairs };
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

export const repairQuotedFields = (line: string): { value: string; repairs: string[] } => {
  const repairs: string[] = [];
  let repairedLine = line;

  // Fix unclosed quotes
  const quoteCount = (repairedLine.match(/"/g) || []).length;
  if (quoteCount % 2 !== 0) {
    repairs.push('Added missing closing quote');
    repairedLine = repairedLine + '"';
  }

  // Fix consecutive quotes that aren't escaped
  repairedLine = repairedLine.replace(/"{2,}/g, (match) => {
    if (match.length % 2 === 0) {
      return match; // Even number of quotes - likely intentional escaping
    } else {
      repairs.push('Fixed unescaped consecutive quotes');
      return '"'.repeat(match.length - 1); // Remove one quote to make it even
    }
  });

  return { value: repairedLine, repairs };
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
    // Check if the next row might be a continuation of a quoted field
    if (!nextRow.includes('"') || nextRow.trim().startsWith('"')) {
      const nextRowParts = nextRow.split(',');
      const remaining = expectedColumns - currentRow.length;
      
      // Only take what we need from the next row
      const neededParts = nextRowParts.slice(0, remaining);
      repairedRow = [...currentRow, ...neededParts];
      
      repairs.push('Merged split row due to line break in quoted field');
      skipNextRow = true;
    }
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
interface ParseResult {
  values: string[];
  repairs: string[];
}

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

export const parseCSVLine = (line: string): ParseResult => {
  const result: string[] = [];
  const repairs: string[] = [];
  let current = '';
  let inQuotes = false;
  
  // Handle empty line
  if (!line.trim()) {
    return { values: [], repairs: ['Empty line skipped'] };
  }

  // Split line into characters and process
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    // Handle quotes
    if (char === '"' || char === "'") {
      if (!inQuotes) {
        inQuotes = true;
        if (char === "'") {
          repairs.push('Converted single quote to double quote');
        }
        continue;
      } else {
        inQuotes = false;
        continue;
      }
    }

    // Handle delimiters
    if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  // Add the last value
  result.push(current.trim());

  // If still in quotes at the end, note it
  if (inQuotes) {
    repairs.push('Unclosed quote detected and handled');
  }

  return { values: result, repairs };
};
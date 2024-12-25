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
  let unclosedQuote = false;
  let lastQuoteIndex = -1;
  
  // Handle empty line
  if (!line.trim()) {
    return { values: [], repairs: ['Empty line skipped'] };
  }

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];
    const prevChar = line[i - 1];
    
    // Handle quote characters
    if (char === '"') {
      // Start of quoted content
      if (!inQuotes && (i === 0 || prevChar === ',' || prevChar === ' ')) {
        inQuotes = true;
        lastQuoteIndex = i;
        continue;
      }
      // End of quoted content
      else if (inQuotes && (nextChar === ',' || nextChar === undefined)) {
        inQuotes = false;
        continue;
      }
      // Escaped quote within quoted content
      else if (inQuotes && nextChar === '"') {
        current += '"';
        i++; // Skip next quote
        continue;
      }
      // Unmatched quote - attempt repair
      else {
        repairs.push(`Unmatched quote found at position ${i}, attempting repair`);
        if (i - lastQuoteIndex > 1) {
          // If there's significant content since the last quote, treat this as a closing quote
          inQuotes = false;
        } else {
          // Otherwise, treat it as an opening quote
          inQuotes = true;
          lastQuoteIndex = i;
        }
        continue;
      }
    }
    
    // Handle delimiters
    if (char === ',' && !inQuotes) {
      if (unclosedQuote) {
        repairs.push('Closed unclosed quote before delimiter');
        unclosedQuote = false;
      }
      result.push(current.trim());
      current = '';
      continue;
    }
    
    current += char;
  }
  
  // Add the last value
  result.push(current.trim());
  
  // Handle any remaining unclosed quotes
  if (inQuotes) {
    repairs.push('Closed unclosed quote at end of line');
  }

  return { values: result, repairs };
};

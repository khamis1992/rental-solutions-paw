export interface CSVValidationError {
  row: number;
  expected: number;
  actual: number;
  data: string[];
}

export const parseCSV = (content: string): { data: any[]; errors: CSVValidationError[] } => {
  const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
  const expectedColumns = 8;
  const data: any[] = [];
  const errors: CSVValidationError[] = [];

  // Process each line after headers
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    let values: string[] = [];

    // Handle quoted values and commas within quotes
    let currentValue = '';
    let insideQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      
      if (char === '"') {
        insideQuotes = !insideQuotes;
        continue;
      }
      
      if (char === ',' && !insideQuotes) {
        values.push(currentValue.trim());
        currentValue = '';
        continue;
      }
      
      currentValue += char;
    }
    values.push(currentValue.trim()); // Add the last value

    // Validate column count
    if (values.length !== expectedColumns) {
      console.error(`Row ${i} has incorrect number of columns:`, {
        expected: expectedColumns,
        actual: values.length,
        data: values
      });
      
      errors.push({
        row: i,
        expected: expectedColumns,
        actual: values.length,
        data: values
      });
      continue; // Skip this row
    }

    // Create object from valid row
    const rowData = headers.reduce((obj, header, index) => {
      obj[header] = values[index];
      return obj;
    }, {} as Record<string, string>);

    data.push(rowData);
  }

  return { data, errors };
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
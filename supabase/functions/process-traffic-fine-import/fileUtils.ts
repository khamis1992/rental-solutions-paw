import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

export const downloadFile = async (
  supabase: ReturnType<typeof createClient>,
  fileName: string
): Promise<string> => {
  console.log('Downloading file:', fileName);
  
  const { data: fileData, error: downloadError } = await supabase
    .storage
    .from('imports')
    .download(fileName);

  if (downloadError) {
    console.error('Download error:', downloadError);
    throw new Error(`Failed to download file: ${downloadError.message}`);
  }

  return await fileData.text();
};

export const validateHeaders = (headers: string[]): { isValid: boolean; errors: string[] } => {
  console.log('Validating headers:', headers);
  
  const expectedHeaders = [
    'serial_number',
    'violation_number',
    'violation_date',
    'license_plate',
    'fine_location',
    'violation_charge',
    'fine_amount',
    'violation_points'
  ];

  const errors: string[] = [];
  const normalizedHeaders = headers.map(h => h.toLowerCase().trim());

  // Check for missing required headers
  const missingHeaders = expectedHeaders.filter(h => !normalizedHeaders.includes(h));
  if (missingHeaders.length > 0) {
    errors.push(`Missing required headers: ${missingHeaders.join(', ')}`);
  }

  // Check for extra headers
  const extraHeaders = normalizedHeaders.filter(h => !expectedHeaders.includes(h));
  if (extraHeaders.length > 0) {
    errors.push(`Unexpected headers found: ${extraHeaders.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const parseCSVContent = (content: string): { headers: string[]; rows: string[][] } => {
  console.log('Parsing CSV content');
  
  const lines = content.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
    
  if (lines.length === 0) {
    throw new Error('CSV file is empty');
  }

  const headers = parseCSVLine(lines[0]);
  console.log('Parsed headers:', headers);

  const rows = lines.slice(1).map((line, index) => {
    const row = parseCSVLine(line);
    console.log(`Row ${index + 1}:`, row);
    
    if (row.length !== headers.length) {
      throw new Error(`Row ${index + 1} has ${row.length} columns but expected ${headers.length}`);
    }
    
    return row;
  });

  return { headers, rows };
};

export const parseCSVLine = (line: string): string[] => {
  const values: string[] = [];
  let currentValue = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (!insideQuotes) {
        insideQuotes = true;
        continue;
      } else if (nextChar === '"') {
        currentValue += '"';
        i++; // Skip next quote
        continue;
      } else {
        insideQuotes = false;
        continue;
      }
    }

    if (char === ',' && !insideQuotes) {
      values.push(currentValue.trim());
      currentValue = '';
      continue;
    }

    currentValue += char;
  }

  values.push(currentValue.trim());
  return values;
};
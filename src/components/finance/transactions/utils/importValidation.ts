export const validateFileContent = (content: string): boolean => {
  // Check if content is empty
  if (!content || content.trim() === '') {
    console.error('Invalid file content: Empty content');
    return false;
  }

  // Check if content looks like HTML by checking for common HTML tags
  const htmlPattern = /<[^>]*>|<!DOCTYPE|<html|<body|<script/i;
  if (htmlPattern.test(content)) {
    console.error('Invalid file content: Contains HTML');
    return false;
  }

  // Verify CSV structure
  const lines = content.split('\n');
  if (lines.length < 2) {
    console.error('Invalid file content: No data rows found');
    return false;
  }

  // Verify headers
  const expectedHeaders = [
    'Lease_ID',
    'Customer_Name',
    'Amount',
    'License_Plate',
    'Vehicle',
    'Payment_Date',
    'Payment_Method',
    'Transaction_ID',
    'Description',
    'Type',
    'Status'
  ];

  const headers = lines[0].split(',').map(h => h.trim());
  const hasValidHeaders = expectedHeaders.every(h => headers.includes(h));

  if (!hasValidHeaders) {
    console.error('Invalid file content: Missing required headers');
    console.error('Expected:', expectedHeaders);
    console.error('Found:', headers);
    return false;
  }

  // Verify that all lines have the same number of columns as headers
  const headerCount = headers.length;
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === '') continue; // Skip empty lines
    
    const columns = line.split(',');
    if (columns.length !== headerCount) {
      console.error(`Invalid file content: Line ${i + 1} has ${columns.length} columns, expected ${headerCount}`);
      console.error('Line content:', line);
      console.error('Columns found:', columns);
      return false;
    }
  }

  return true;
};

// Add utility function to help repair common CSV issues
export const repairCSVLine = (line: string, expectedColumns: number): string => {
  const columns = line.split(',');
  
  // If we have too few columns, pad with empty values
  while (columns.length < expectedColumns) {
    columns.push('');
  }
  
  // If we have too many columns, truncate
  if (columns.length > expectedColumns) {
    columns.length = expectedColumns;
  }
  
  return columns.join(',');
};
export const validateFileContent = (content: string): boolean => {
  // Check if content looks like HTML
  if (content.includes('<!DOCTYPE html>') || content.includes('<html')) {
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
    return false;
  }

  return true;
};
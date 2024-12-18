export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const parseDate = (dateStr: string): string | null => {
  if (!dateStr || dateStr.trim() === '') return null;
  
  // Try to parse DD/MM/YYYY format
  const ddmmyyyy = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (ddmmyyyy) {
    const [_, day, month, year] = ddmmyyyy;
    const paddedDay = day.padStart(2, '0');
    const paddedMonth = month.padStart(2, '0');
    return `${year}-${paddedMonth}-${paddedDay}`;
  }
  
  // Return the original string if it doesn't match the expected format
  return dateStr;
};

export const validateRowData = (rowData: any, headers: string[]) => {
  // Remove validation to allow all data through
  return 'pending';
};

export const extractRowData = (currentRowValues: string[], headers: string[]) => {
  return {
    agreementNumber: currentRowValues[headers.indexOf('Agreement Number')]?.trim() || `AGR${Date.now()}`,
    licenseNo: currentRowValues[headers.indexOf('License No')]?.trim() || null,
    fullName: currentRowValues[headers.indexOf('full_name')]?.trim() || 'Unknown Customer',
    licenseNumber: currentRowValues[headers.indexOf('License Number')]?.trim() || null,
    checkoutDate: parseDate(currentRowValues[headers.indexOf('Check-out Date')]?.trim()),
    checkinDate: parseDate(currentRowValues[headers.indexOf('Check-in Date')]?.trim()),
    returnDate: parseDate(currentRowValues[headers.indexOf('Return Date')]?.trim()),
    status: currentRowValues[headers.indexOf('STATUS')]?.trim()?.toLowerCase() || 'pending',
  };
};
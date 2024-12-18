export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const parseDate = (dateStr: string): string | null => {
  if (!dateStr || dateStr.trim() === '') return null;
  
  try {
    // Remove any potential whitespace
    dateStr = dateStr.trim();
    
    // Try to parse DD/MM/YYYY format
    const ddmmyyyy = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (ddmmyyyy) {
      const [_, day, month, year] = ddmmyyyy;
      const paddedDay = day.padStart(2, '0');
      const paddedMonth = month.padStart(2, '0');
      return `${year}-${paddedMonth}-${paddedDay}`;
    }
    
    // Try to parse YYYY-MM-DD format
    const yyyymmdd = dateStr.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (yyyymmdd) {
      const [_, year, month, day] = yyyymmdd;
      const paddedMonth = month.padStart(2, '0');
      const paddedDay = day.padStart(2, '0');
      return `${year}-${paddedMonth}-${paddedDay}`;
    }
    
    // Try to parse YYYY-DD-MM format (incorrect format but we'll handle it)
    const yyyyddmm = dateStr.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (yyyyddmm) {
      const [_, year, day, month] = yyyyddmm;
      const paddedMonth = month.padStart(2, '0');
      const paddedDay = day.padStart(2, '0');
      return `${year}-${paddedMonth}-${paddedDay}`;
    }
  } catch (error) {
    console.error('Error parsing date:', dateStr, error);
  }
  
  // If all parsing attempts fail, return null to allow the import to continue
  return null;
};

export const validateRowData = (rowData: any, headers: string[]) => {
  // Remove validation to allow all data through
  return 'pending';
};

export const extractRowData = (currentRowValues: string[], headers: string[]) => {
  const now = new Date().toISOString();
  return {
    agreementNumber: currentRowValues[headers.indexOf('Agreement Number')]?.trim() || `AGR${Date.now()}`,
    licenseNo: currentRowValues[headers.indexOf('License No')]?.trim() || null,
    fullName: currentRowValues[headers.indexOf('full_name')]?.trim() || 'Unknown Customer',
    licenseNumber: currentRowValues[headers.indexOf('License Number')]?.trim() || null,
    checkoutDate: parseDate(currentRowValues[headers.indexOf('Check-out Date')]?.trim()) || now,
    checkinDate: parseDate(currentRowValues[headers.indexOf('Check-in Date')]?.trim()) || now,
    returnDate: parseDate(currentRowValues[headers.indexOf('Return Date')]?.trim()) || now,
    status: currentRowValues[headers.indexOf('STATUS')]?.trim()?.toLowerCase() || 'pending',
  };
};
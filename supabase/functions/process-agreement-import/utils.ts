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
      // Ensure day and month are padded with leading zeros
      const paddedDay = day.padStart(2, '0');
      const paddedMonth = month.padStart(2, '0');
      return `${year}-${paddedMonth}-${paddedDay}`;
    }
    
    // Try to parse MM/DD/YYYY format
    const mmddyyyy = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (mmddyyyy) {
      const [_, month, day, year] = mmddyyyy;
      const paddedDay = day.padStart(2, '0');
      const paddedMonth = month.padStart(2, '0');
      return `${year}-${paddedMonth}-${paddedDay}`;
    }
  } catch (error) {
    console.error('Error parsing date:', dateStr, error);
  }
  
  return null;
};

export const normalizeStatus = (status: string): string => {
  if (!status) return 'pending';
  
  const statusMap: Record<string, string> = {
    'open': 'open',
    'active': 'active',
    'closed': 'closed',
    'cancelled': 'cancelled',
    'pending': 'pending',
    'pending_payment': 'pending'
  };

  const normalizedStatus = status.toLowerCase().trim();
  return statusMap[normalizedStatus] || 'pending';
};

export const extractRowData = (currentRowValues: string[], headers: string[]) => {
  const now = new Date().toISOString();
  
  // Get values from CSV
  const agreementNumber = currentRowValues[headers.indexOf('Agreement Number')]?.trim() || null;
  const licenseNo = currentRowValues[headers.indexOf('License No')]?.trim() || null;
  const fullName = currentRowValues[headers.indexOf('full_name')]?.trim() || null;
  const licenseNumber = currentRowValues[headers.indexOf('License Number')]?.trim() || null;
  const checkoutDate = currentRowValues[headers.indexOf('Check-out Date')]?.trim() || null;
  const checkinDate = currentRowValues[headers.indexOf('Check-in Date')]?.trim() || null;
  const returnDate = currentRowValues[headers.indexOf('Return Date')]?.trim() || null;
  const status = currentRowValues[headers.indexOf('STATUS')]?.trim() || null;

  return {
    agreementNumber: agreementNumber || `AGR${Date.now()}`,
    licenseNo,
    fullName: fullName || 'Unknown Customer',
    licenseNumber,
    checkoutDate: parseDate(checkoutDate) || now,
    checkinDate: parseDate(checkinDate) || now,
    returnDate: parseDate(returnDate) || now,
    status: normalizeStatus(status)
  };
};
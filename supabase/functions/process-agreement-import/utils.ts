export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const parseDate = (dateStr: string): string | null => {
  if (!dateStr || dateStr.trim() === '') return null;
  
  // Just return the date string as is, without validation
  return dateStr.trim();
};

export const validateRowData = (rowData: any, headers: string[]) => {
  const missingFields = [];
  if (!rowData.agreementNumber) missingFields.push('Agreement Number');
  if (!rowData.fullName) missingFields.push('full_name');
  if (!rowData.status) missingFields.push('STATUS');

  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }

  const statusMapping: { [key: string]: string } = {
    'active': 'active',
    'pending': 'pending',
    'pending_payment': 'pending',
    'pending_deposit': 'pending',
    'completed': 'completed',
    'cancelled': 'cancelled',
    'closed': 'completed',
    'done': 'completed',
    'cancel': 'cancelled',
    'canceled': 'cancelled',
    'open': 'active'
  };

  const mappedStatus = statusMapping[rowData.status.toLowerCase()];
  if (!mappedStatus) {
    throw new Error(`Invalid status value: "${rowData.status}". Allowed values are: ${Object.keys(statusMapping).join(', ')}`);
  }

  return mappedStatus;
};

export const extractRowData = (currentRowValues: string[], headers: string[]) => {
  const checkoutDate = parseDate(currentRowValues[headers.indexOf('Check-out Date')]?.trim());
  const checkinDate = parseDate(currentRowValues[headers.indexOf('Check-in Date')]?.trim());
  const returnDate = parseDate(currentRowValues[headers.indexOf('Return Date')]?.trim());

  console.log('Parsed dates:', {
    checkoutDate,
    checkinDate,
    returnDate
  });

  return {
    agreementNumber: currentRowValues[headers.indexOf('Agreement Number')]?.trim(),
    licenseNo: currentRowValues[headers.indexOf('License No')]?.trim(),
    fullName: currentRowValues[headers.indexOf('full_name')]?.trim(),
    licenseNumber: currentRowValues[headers.indexOf('License Number')]?.trim(),
    checkoutDate,
    checkinDate,
    returnDate,
    status: currentRowValues[headers.indexOf('STATUS')]?.trim()?.toLowerCase(),
  };
};
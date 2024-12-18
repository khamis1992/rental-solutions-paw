export const convertDateFormat = (dateStr: string): string | null => {
  if (!dateStr || dateStr.trim() === '') return null;
  
  try {
    // Split the date string by '/'
    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;
    
    // Parse the parts as numbers and validate them
    // Input format is MM/DD/YYYY
    let [month, day, year] = parts.map(part => parseInt(part.trim(), 10));
    
    // Validate month (1-12)
    if (month < 1 || month > 12) return null;
    
    // Validate day (1-31, could be more specific per month)
    if (day < 1 || day > 31) return null;
    
    // Validate year (reasonable range)
    if (year < 2000 || year > 2100) return null;
    
    // Format with leading zeros
    const formattedMonth = month.toString().padStart(2, '0');
    const formattedDay = day.toString().padStart(2, '0');
    
    return `${year}-${formattedMonth}-${formattedDay}`;
  } catch (error) {
    console.error('Error parsing date:', dateStr, error);
    return null;
  }
};
export const convertDateFormat = (dateStr: string): string | null => {
  if (!dateStr || dateStr.trim() === '') return null;
  
  try {
    // Split the date string by '/'
    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;
    
    // Parse the parts as numbers (MM/DD/YYYY format)
    const [month, day, year] = parts.map(part => parseInt(part.trim(), 10));
    
    // Validate month (1-12)
    if (month < 1 || month > 12) {
      console.error('Invalid month:', month);
      return null;
    }
    
    // Validate day (1-31)
    if (day < 1 || day > 31) {
      console.error('Invalid day:', day);
      return null;
    }
    
    // Validate year (reasonable range)
    if (year < 2000 || year > 2100) {
      console.error('Invalid year:', year);
      return null;
    }
    
    // Format with leading zeros
    const formattedMonth = month.toString().padStart(2, '0');
    const formattedDay = day.toString().padStart(2, '0');
    
    return `${year}-${formattedMonth}-${formattedDay}`;
  } catch (error) {
    console.error('Error parsing date:', dateStr, error);
    return null;
  }
};

export const formatDateToDisplay = (dateStr: string | null): string => {
  if (!dateStr) return '';
  
  try {
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error('Error formatting date:', dateStr, error);
    return dateStr;
  }
};
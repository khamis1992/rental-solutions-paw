export const convertDateFormat = (dateStr: string): string | null => {
  if (!dateStr || dateStr.trim() === '') return null;
  
  try {
    // First check if the value is a number (like 528.000)
    const numValue = parseFloat(dateStr);
    if (!isNaN(numValue)) {
      // Convert Excel serial date number to JavaScript date
      const date = new Date((numValue - 25569) * 86400 * 1000);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    // If not a number, try parsing as regular date string
    const parts = dateStr.split(/[/-]/); // Split by either / or -
    if (parts.length !== 3) return null;
    
    // Parse the parts as numbers (DD/MM/YYYY format)
    const [day, month, year] = parts.map(part => parseInt(part.trim(), 10));
    
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
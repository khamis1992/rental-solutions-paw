const isValidDate = (date: Date): boolean => {
  return date instanceof Date && !isNaN(date.getTime());
};

export const convertDateFormat = (dateStr: string): string | null => {
  if (!dateStr || typeof dateStr !== 'string' || dateStr.trim() === '') {
    console.warn('Invalid date string provided:', dateStr);
    return null;
  }
  
  try {
    // Handle Excel serial date numbers
    const numValue = parseFloat(dateStr);
    if (!isNaN(numValue)) {
      const date = new Date((numValue - 25569) * 86400 * 1000);
      if (!isValidDate(date)) {
        console.warn('Invalid Excel date value:', numValue);
        return null;
      }
      return date.toISOString().split('T')[0];
    }

    // Handle regular date strings
    const parts = dateStr.split(/[/-]/);
    if (parts.length !== 3) {
      console.warn('Invalid date format. Expected DD/MM/YYYY or DD-MM-YYYY:', dateStr);
      return null;
    }
    
    const [day, month, year] = parts.map(part => {
      const num = parseInt(part.trim(), 10);
      if (isNaN(num)) {
        throw new Error(`Invalid date part: ${part}`);
      }
      return num;
    });
    
    // Validate date parts
    if (month < 1 || month > 12) {
      console.warn('Invalid month:', month);
      return null;
    }
    
    if (day < 1 || day > 31) {
      console.warn('Invalid day:', day);
      return null;
    }
    
    if (year < 2000 || year > 2100) {
      console.warn('Invalid year:', year);
      return null;
    }
    
    // Additional validation for days in month
    const date = new Date(year, month - 1, day);
    if (!isValidDate(date) || date.getDate() !== day) {
      console.warn('Invalid date combination:', { day, month, year });
      return null;
    }
    
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  } catch (error) {
    console.error('Error parsing date:', dateStr, error);
    return null;
  }
};

export const formatDateToDisplay = (dateStr: string | null): string => {
  if (!dateStr) return '';
  
  try {
    const date = new Date(dateStr);
    if (!isValidDate(date)) {
      console.warn('Invalid date string for display:', dateStr);
      return dateStr;
    }
    
    return date.toLocaleDateString(undefined, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', dateStr, error);
    return dateStr;
  }
};
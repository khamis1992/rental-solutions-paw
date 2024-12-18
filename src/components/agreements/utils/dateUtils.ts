export const parseDate = (dateStr: string): string | null => {
  if (!dateStr || dateStr.trim() === '') return null;
  
  try {
    // Remove any potential whitespace
    dateStr = dateStr.trim();
    
    // Try to parse DD/MM/YYYY format
    const ddmmyyyy = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (ddmmyyyy) {
      const [_, day, month, year] = ddmmyyyy;
      // Validate date components
      const d = parseInt(day, 10);
      const m = parseInt(month, 10);
      const y = parseInt(year, 10);
      
      // Basic date validation
      if (m < 1 || m > 12) return null;
      const daysInMonth = new Date(y, m, 0).getDate();
      if (d < 1 || d > daysInMonth) return null;
      
      // Ensure day and month are padded with leading zeros
      const paddedDay = day.padStart(2, '0');
      const paddedMonth = month.padStart(2, '0');
      return `${year}-${paddedMonth}-${paddedDay}`;
    }
  } catch (error) {
    console.error('Error parsing date:', dateStr, error);
  }
  
  return null;
};
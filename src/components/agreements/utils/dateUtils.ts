export const parseDate = (dateStr: string): string | null => {
  if (!dateStr || dateStr.trim() === '') return null;
  
  try {
    // Remove any potential whitespace
    dateStr = dateStr.trim();
    
    // For YYYY-DD-MM format (from CSV)
    const yyyyddmm = dateStr.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (yyyyddmm) {
      const [_, year, day, month] = yyyyddmm;
      // Ensure month and day are padded with leading zeros
      const paddedMonth = month.padStart(2, '0');
      const paddedDay = day.padStart(2, '0');
      return `${year}-${paddedMonth}-${paddedDay}`;
    }
    
    // For DD/MM/YYYY format
    const ddmmyyyy = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (ddmmyyyy) {
      const [_, day, month, year] = ddmmyyyy;
      // Ensure month and day are padded with leading zeros
      const paddedMonth = month.padStart(2, '0');
      const paddedDay = day.padStart(2, '0');
      return `${year}-${paddedMonth}-${paddedDay}`;
    }
  } catch (error) {
    console.error('Error parsing date:', dateStr, error);
  }
  
  return null;
};
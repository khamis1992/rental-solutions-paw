export const parseDate = (dateStr: string): string | null => {
  if (!dateStr || dateStr.trim() === '') return null;
  
  try {
    const [day, month, year] = dateStr.split('/').map(num => num.trim());
    if (day && month && year) {
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
  } catch (error) {
    console.error('Error parsing date:', dateStr, error);
  }
  
  return null;
};
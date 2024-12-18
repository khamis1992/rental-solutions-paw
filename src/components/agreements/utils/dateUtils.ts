export const parseDate = (dateStr: string): string => {
  if (!dateStr || dateStr.trim() === '') return new Date().toISOString();
  
  // Just return the date string as-is, without any validation
  return dateStr;
};
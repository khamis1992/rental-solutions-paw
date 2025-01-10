import { format, isValid } from "date-fns";

/**
 * Formats a date into DD/MM/YYYY format
 * @param date - Date object or string to format
 * @returns Formatted date string or empty string if invalid
 */
export const formatDate = (date: Date | string | null): string => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (!isValid(dateObj)) {
      console.warn('Invalid date provided to formatDate:', date);
      return '';
    }
    
    return format(dateObj, 'dd/MM/yyyy');
  } catch (error) {
    console.error('Error formatting date:', date, error);
    return '';
  }
};

/**
 * Formats a date into a display-friendly format with time
 * @param date - Date object or string to format
 * @returns Formatted date string or empty string if invalid
 */
export const formatDateToDisplay = (date: Date | string | null): string => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (!isValid(dateObj)) {
      console.warn('Invalid date provided to formatDateToDisplay:', date);
      return '';
    }
    
    return format(dateObj, 'dd/MM/yyyy HH:mm');
  } catch (error) {
    console.error('Error formatting date:', date, error);
    return '';
  }
};
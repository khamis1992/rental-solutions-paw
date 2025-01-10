import { format, parse, isValid } from "date-fns";

/**
 * Standard date format used across the application
 */
export const DATE_FORMAT = "dd/MM/yyyy";

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
    
    return format(dateObj, DATE_FORMAT);
  } catch (error) {
    console.error('Error formatting date:', date, error);
    return '';
  }
};

/**
 * Validates if a string matches DD/MM/YYYY format
 * @param dateStr - Date string to validate
 * @returns True if valid, false otherwise
 */
export const isValidDateFormat = (dateStr: string): boolean => {
  if (!dateStr) return false;

  // Check basic format using regex
  const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  if (!regex.test(dateStr)) return false;

  // Parse and validate the date
  try {
    const parsedDate = parse(dateStr, DATE_FORMAT, new Date());
    return isValid(parsedDate);
  } catch {
    return false;
  }
};

/**
 * Parses a date string in DD/MM/YYYY format to a Date object
 * @param dateStr - Date string to parse
 * @returns Date object or null if invalid
 */
export const parseDateString = (dateStr: string): Date | null => {
  if (!isValidDateFormat(dateStr)) return null;
  
  try {
    const parsedDate = parse(dateStr, DATE_FORMAT, new Date());
    return isValid(parsedDate) ? parsedDate : null;
  } catch {
    return null;
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
    
    return format(dateObj, `${DATE_FORMAT} HH:mm`);
  } catch (error) {
    console.error('Error formatting date:', date, error);
    return '';
  }
};

/**
 * Converts a date string from any format to DD/MM/YYYY
 * @param dateStr - Date string to convert
 * @returns Formatted date string or empty string if invalid
 */
export const convertToStandardFormat = (dateStr: string): string => {
  if (!dateStr) return '';
  
  try {
    const date = new Date(dateStr);
    if (!isValid(date)) return '';
    return formatDate(date);
  } catch {
    return '';
  }
};
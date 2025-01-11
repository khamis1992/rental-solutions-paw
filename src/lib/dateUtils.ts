import { format, parse, isValid } from "date-fns";

export const DATE_FORMAT = "dd/MM/yyyy";
export const ISO_FORMAT = "yyyy-MM-dd";

/**
 * Formats a date into DD/MM/YYYY format
 */
export const formatDateToDisplay = (date: Date | string | null): string => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (!isValid(dateObj)) {
      console.warn('Invalid date provided to formatDateToDisplay:', date);
      return '';
    }
    return format(dateObj, DATE_FORMAT);
  } catch (error) {
    console.error('Error formatting date:', date, error);
    return '';
  }
};

/**
 * Parses a DD/MM/YYYY formatted string to a Date object
 */
export const parseDateFromDisplay = (dateStr: string): Date | null => {
  try {
    const parsedDate = parse(dateStr, DATE_FORMAT, new Date());
    return isValid(parsedDate) ? parsedDate : null;
  } catch (error) {
    console.error('Error parsing date:', dateStr, error);
    return null;
  }
};

/**
 * Validates if a string matches DD/MM/YYYY format
 */
export const isValidDateFormat = (dateStr: string): boolean => {
  if (!dateStr) return false;
  
  // Basic format check using regex
  const formatRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
  if (!formatRegex.test(dateStr)) return false;
  
  // Parse and validate the date
  const parsedDate = parseDateFromDisplay(dateStr);
  return parsedDate !== null;
};

/**
 * Converts a date to ISO format for API calls
 */
export const formatDateForApi = (date: Date | string | null): string => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (!isValid(dateObj)) return '';
    return format(dateObj, ISO_FORMAT);
  } catch (error) {
    console.error('Error formatting date for API:', date, error);
    return '';
  }
};

/**
 * Converts an ISO date from API to display format
 */
export const formatApiDateToDisplay = (isoDate: string | null): string => {
  if (!isoDate) return '';
  
  try {
    const date = new Date(isoDate);
    return formatDateToDisplay(date);
  } catch (error) {
    console.error('Error converting API date to display format:', isoDate, error);
    return '';
  }
};
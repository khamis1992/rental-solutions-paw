export const isValidDate = (dateValue: string): boolean => {
  const timestamp = Date.parse(dateValue);
  return !isNaN(timestamp);
};

export const formatDateToISO = (dateValue: string): string | null => {
  try {
    if (!isValidDate(dateValue)) {
      console.error('Invalid date value:', dateValue);
      return null;
    }
    return new Date(dateValue).toISOString();
  } catch (error) {
    console.error('Error formatting date:', dateValue, error);
    return null;
  }
};
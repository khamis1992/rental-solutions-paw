import { ParseResult } from './types';

export const parseCSV = (content: string) => {
  const lines = content.split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  
  return lines.slice(1).map(line => {
    // Handle quoted values properly to preserve special characters
    const values = line.match(/(?:^|,)("(?:[^"]*(?:""[^"]*)*)"|\d+|[^,]*)/g)
      ?.map(v => {
        // Remove leading comma and quotes, replace double quotes with single
        const cleaned = v.replace(/^,?"?|"?$/g, '').replace(/""/g, '"');
        return cleaned.trim();
      }) || [];

    return headers.reduce((obj, header, index) => {
      obj[header] = values[index] || '';
      return obj;
    }, {} as Record<string, string>);
  });
};

export const validateCSVHeaders = (headers: string[]) => {
  const requiredHeaders = [
    'Agreement Number',
    'Customer Name',
    'Amount',
    'License Plate',
    'Vehicle',
    'Payment Date',
    'Payment Method',
    'Payment Number',
    'Payment Description',
    'Type'
  ];

  const missingHeaders = requiredHeaders.filter(
    header => !headers.includes(header)
  );

  return {
    isValid: missingHeaders.length === 0,
    missingHeaders
  };
};

// New function to sanitize agreement numbers while preserving special characters
export const sanitizeAgreementNumber = (value: string): string => {
  // Only remove control characters and normalize whitespace
  return value.replace(/[\x00-\x1F\x7F]/g, '').trim();
};

// New function to validate agreement number format
export const validateAgreementNumber = (value: string): boolean => {
  // Basic validation - just ensure it's not empty and doesn't contain control characters
  return value.length > 0 && !/[\x00-\x1F\x7F]/.test(value);
};
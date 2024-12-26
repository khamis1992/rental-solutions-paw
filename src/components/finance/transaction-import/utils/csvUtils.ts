import { validateAndRepairCSV, displayValidationErrors } from './csvValidation';

export const parseCSV = (content: string) => {
  const requiredHeaders = [
    'agreement_number',
    'customer_name',
    'amount',
    'license_plate',
    'vehicle',
    'payment_date',
    'payment_method',
    'payment_number',
    'payment_description'
  ];

  try {
    // Validate and repair CSV data
    const { isValid, repairedData, errors } = validateAndRepairCSV(content, requiredHeaders.length);
    
    if (errors) {
      displayValidationErrors(errors);
      if (!isValid) {
        throw new Error('CSV validation failed. Please fix the errors and try again.');
      }
    }

    if (!repairedData || repairedData.length < 2) {
      throw new Error('No valid data rows found in CSV');
    }

    const headers = repairedData[0].map(h => h.toLowerCase().trim());

    // Validate required headers
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    if (missingHeaders.length > 0) {
      throw new Error(
        `Missing required headers: ${missingHeaders.join(', ')}\n\n` +
        `Expected CSV format:\n${requiredHeaders.join(',')}`
      );
    }

    // Process data rows
    return repairedData.slice(1).map((values, index) => {
      const row = headers.reduce((obj: Record<string, any>, header, i) => {
        // Handle amount field specially
        if (header === 'amount') {
          const amount = parseFloat(values[i]);
          if (isNaN(amount)) {
            throw new Error(`Invalid amount format in row ${index + 2}: ${values[i]}`);
          }
          obj[header] = amount;
        } else {
          obj[header] = values[i] || null;
        }
        return obj;
      }, {});

      // Validate required fields
      for (const field of requiredHeaders) {
        if (row[field] === undefined || row[field] === null) {
          throw new Error(
            `Missing required field "${field}" in row ${index + 2}.\n` +
            `Row data: ${values.join(',')}\n\n` +
            `All fields are required: ${requiredHeaders.join(', ')}`
          );
        }
      }

      return row;
    });
  } catch (error) {
    console.error('CSV parsing error:', error);
    throw error;
  }
};
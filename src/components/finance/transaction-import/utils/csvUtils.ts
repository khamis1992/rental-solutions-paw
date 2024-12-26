export const parseCSV = (content: string) => {
  try {
    const lines = content.split('\n');
    if (lines.length === 0) {
      throw new Error('CSV file is empty');
    }

    // Define headers in the exact order expected
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

    // Normalize headers by removing spaces and making lowercase
    const headers = lines[0].toLowerCase().split(',').map(h => h.trim());

    // Validate headers
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    if (missingHeaders.length > 0) {
      throw new Error(
        `Missing required headers: ${missingHeaders.join(', ')}\n\n` +
        `Expected CSV format:\n${requiredHeaders.join(',')}`
      );
    }

    return lines.slice(1)
      .filter(line => line.trim().length > 0)
      .map((line, index) => {
        const values = line.split(',').map(v => v.trim());
        
        // Check if we have enough values for all headers
        if (values.length !== headers.length) {
          throw new Error(
            `Row ${index + 2} has ${values.length} values but should have ${headers.length} values.\n\n` +
            `Problem row: ${line}\n\n` +
            `Please ensure each row has values for: ${requiredHeaders.join(', ')}`
          );
        }

        const row = headers.reduce((obj, header, index) => {
          // Ensure amount is a valid number
          if (header === 'amount') {
            const amount = parseFloat(values[index]);
            if (isNaN(amount)) {
              throw new Error(`Invalid amount format in row ${index + 2}: ${values[index]}`);
            }
            obj[header] = amount;
          } else {
            obj[header] = values[index] || null;
          }
          return obj;
        }, {} as Record<string, any>);

        // Validate required fields
        for (const field of requiredHeaders) {
          if (row[field] === undefined || row[field] === null) {
            throw new Error(
              `Missing required field "${field}" in row ${index + 2}.\n` +
              `Row data: ${line}\n\n` +
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
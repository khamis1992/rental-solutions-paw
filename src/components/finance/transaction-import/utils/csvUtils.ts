export const parseCSV = (content: string) => {
  try {
    const lines = content.split('\n');
    if (lines.length === 0) {
      throw new Error('CSV file is empty');
    }

    // Normalize headers by removing spaces and making lowercase
    const headers = lines[0].toLowerCase().split(',').map(h => h.trim().replace(/\s+/g, '_'));
    const requiredHeaders = [
      'amount',
      'payment_date',
      'payment_method',
      'status',
      'payment_number',
      'payment_description',
      'license_plate',
      'vehicle'
    ];

    // Validate headers
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    if (missingHeaders.length > 0) {
      throw new Error(`Missing required headers: ${missingHeaders.join(', ')}\n\nExpected headers are: ${requiredHeaders.join(', ')}`);
    }

    return lines.slice(1)
      .filter(line => line.trim().length > 0)
      .map((line, index) => {
        const values = line.split(',').map(v => v.trim());
        
        // Check if we have enough values for all headers
        if (values.length !== headers.length) {
          throw new Error(`Row ${index + 2} has ${values.length} values but should have ${headers.length} values`);
        }

        const row = headers.reduce((obj, header, index) => {
          // Ensure amount is a valid number
          if (header === 'amount') {
            const amount = parseFloat(values[index]);
            if (isNaN(amount)) {
              throw new Error(`Invalid amount format in row ${index + 2}: ${line}`);
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
            throw new Error(`Missing required field "${field}" in row ${index + 2}: ${line}`);
          }
        }

        return row;
      });
  } catch (error) {
    console.error('CSV parsing error:', error);
    throw error;
  }
};
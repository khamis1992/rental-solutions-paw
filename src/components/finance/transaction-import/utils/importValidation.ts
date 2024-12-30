interface ValidationResult {
  validRows: any[];
  skippedRows: {
    index: number;
    content: string;
    reason: string;
  }[];
}

export const validateImportData = (content: string): ValidationResult => {
  const REQUIRED_COLUMNS = 9;
  const lines = content.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  if (lines.length < 2) {
    return {
      validRows: [],
      skippedRows: [{
        index: 0,
        content: '',
        reason: 'File is empty or contains only headers'
      }]
    };
  }

  const headers = lines[0].split(',').map(h => h.trim());
  const validRows: any[] = [];
  const skippedRows: { index: number; content: string; reason: string; }[] = [];

  // Process each data row
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const values = line.split(',').map(v => v.trim());

    // Skip completely empty rows
    if (values.every(v => !v)) {
      skippedRows.push({
        index: i + 1,
        content: line,
        reason: 'Row is empty'
      });
      continue;
    }

    // Skip rows with incorrect number of values
    if (values.length !== REQUIRED_COLUMNS) {
      skippedRows.push({
        index: i + 1,
        content: line,
        reason: `Row has ${values.length} values but ${REQUIRED_COLUMNS} are required`
      });
      continue;
    }

    // Create object from valid row
    const rowObject = headers.reduce((obj: Record<string, any>, header, index) => {
      if (header === 'amount') {
        const amount = parseFloat(values[index] || '0');
        if (isNaN(amount)) {
          throw new Error(`Invalid amount format in row ${i + 1}: ${values[index]}`);
        }
        obj[header] = amount;
      } else {
        obj[header] = values[index] || '';
      }
      return obj;
    }, {});

    validRows.push(rowObject);
  }

  return { validRows, skippedRows };
};
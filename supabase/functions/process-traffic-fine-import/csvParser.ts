export const parseCSVRow = (row: string): string[] => {
  const values: string[] = [];
  let currentValue = '';
  let insideQuotes = false;

  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    const nextChar = row[i + 1];

    if (char === '"') {
      if (!insideQuotes) {
        insideQuotes = true;
        continue;
      } else if (nextChar === '"') {
        currentValue += '"';
        i++; // Skip next quote
        continue;
      } else {
        insideQuotes = false;
        continue;
      }
    }

    if (char === ',' && !insideQuotes) {
      values.push(currentValue.trim());
      currentValue = '';
      continue;
    }

    currentValue += char;
  }

  // Add the last value
  values.push(currentValue.trim());
  return values;
}

export const validateRow = (
  rowNumber: number,
  values: string[],
  expectedColumns: number,
  originalRow: string
): void => {
  if (values.length !== expectedColumns) {
    console.error(`Row ${rowNumber} parsing error:`);
    console.error('Original row:', originalRow);
    console.error('Parsed values:', values);
    console.error(`Number of values: ${values.length}`);
    throw new Error(
      `Row ${rowNumber} has incorrect number of columns. Expected ${expectedColumns}, found ${values.length}. Please check for missing values or unmatched quotes.`
    );
  }
}

export const validateDate = (dateValue: string, rowNumber: number): Date => {
  // Try parsing as ISO date first
  const isoDate = new Date(dateValue);
  if (!isNaN(isoDate.getTime())) {
    return isoDate;
  }

  // Try parsing different date formats
  const formats = [
    // YYYY-MM-DD
    /^\d{4}-\d{2}-\d{2}$/,
    // DD/MM/YYYY
    /^\d{2}\/\d{2}\/\d{4}$/,
    // MM/DD/YYYY
    /^\d{2}\/\d{2}\/\d{4}$/
  ];

  for (const format of formats) {
    if (format.test(dateValue)) {
      const [year, month, day] = dateValue.split(/[-\/]/).map(Number);
      const date = new Date(year, month - 1, day);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
  }

  throw new Error(`Invalid date format in row ${rowNumber}: ${dateValue}. Expected YYYY-MM-DD or DD/MM/YYYY`);
}

export const validateNumeric = (value: string, field: string, rowNumber: number): number => {
  const num = parseFloat(value);
  if (isNaN(num)) {
    throw new Error(`Invalid ${field} in row ${rowNumber}: ${value}`);
  }
  return num;
}
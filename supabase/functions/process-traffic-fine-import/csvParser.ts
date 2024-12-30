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
  const date = new Date(dateValue);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date format in row ${rowNumber}: ${dateValue}`);
  }
  return date;
}

export const validateNumeric = (value: string, field: string, rowNumber: number): number => {
  const num = parseFloat(value);
  if (isNaN(num)) {
    throw new Error(`Invalid ${field} in row ${rowNumber}: ${value}`);
  }
  return num;
}
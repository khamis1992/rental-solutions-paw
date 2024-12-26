import { toast } from "@/hooks/use-toast";

interface ValidationResult {
  isValid: boolean;
  repairedData?: string[][];
  errors?: Array<{
    row: number;
    message: string;
    content?: string;
  }>;
}

export const validateAndRepairCSV = (
  content: string,
  expectedColumns: number
): ValidationResult => {
  const lines = content.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0); // Remove empty lines

  if (lines.length < 2) {
    return {
      isValid: false,
      errors: [{
        row: 0,
        message: 'CSV file is empty or contains only headers'
      }]
    };
  }

  const headers = lines[0].split(',').map(h => h.trim());
  const errors: Array<{ row: number; message: string; content?: string }> = [];
  const repairedData: string[][] = [headers];

  // Process each data row
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const values = line.split(',').map(v => v.trim());

    // Skip completely empty rows
    if (values.every(v => !v)) {
      errors.push({
        row: i + 1,
        message: `Row ${i + 1} is empty and will be skipped.`,
        content: line
      });
      continue;
    }

    // Handle rows with fewer values
    if (values.length < expectedColumns) {
      const repairedRow = [...values];
      while (repairedRow.length < expectedColumns) {
        repairedRow.push('');
      }
      
      errors.push({
        row: i + 1,
        message: `Row ${i + 1} has ${values.length} values but ${expectedColumns} are required. Empty values will be used for missing fields.`,
        content: line
      });
      
      repairedData.push(repairedRow);
      continue;
    }

    // Handle rows with too many values
    if (values.length > expectedColumns) {
      errors.push({
        row: i + 1,
        message: `Row ${i + 1} has ${values.length} values but only ${expectedColumns} are expected. Extra values will be ignored.`,
        content: line
      });
      repairedData.push(values.slice(0, expectedColumns));
      continue;
    }

    repairedData.push(values);
  }

  // Return validation result
  return {
    isValid: true, // We're now more permissive since we repair the data
    repairedData,
    errors: errors.length > 0 ? errors : undefined
  };
};

export const displayValidationErrors = (errors: Array<{ row: number; message: string; content?: string }>) => {
  errors.forEach(error => {
    toast({
      title: `Row ${error.row}`,
      description: error.message,
      variant: "destructive",
    });
  });
};
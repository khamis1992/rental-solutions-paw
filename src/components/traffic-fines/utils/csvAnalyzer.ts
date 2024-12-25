import { toast } from "@/hooks/use-toast";

interface CsvAnalysisResult {
  isValid: boolean;
  totalRows: number;
  validRows: number;
  errorRows: number;
  errors: Array<{
    row: number;
    type: string;
    details: string;
    data?: any;
  }>;
  patterns: {
    commonErrors: Record<string, number>;
    problematicColumns: string[];
    dataTypeIssues: Record<string, number>;
  };
}

export const analyzeCsvContent = (content: string, expectedHeaders: string[]): CsvAnalysisResult => {
  console.log('Starting CSV analysis...');
  
  const result: CsvAnalysisResult = {
    isValid: true,
    totalRows: 0,
    validRows: 0,
    errorRows: 0,
    errors: [],
    patterns: {
      commonErrors: {},
      problematicColumns: [],
      dataTypeIssues: {},
    },
  };

  try {
    // Split content into lines and filter out empty lines
    const lines = content.split('\n').filter(line => line.trim());
    result.totalRows = lines.length - 1; // Exclude header row
    
    console.log(`Processing ${result.totalRows} data rows...`);

    // Validate headers
    const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
    const missingHeaders = expectedHeaders.filter(h => !headers.includes(h));
    
    if (missingHeaders.length > 0) {
      result.isValid = false;
      result.errors.push({
        row: 0,
        type: 'header_mismatch',
        details: `Missing required headers: ${missingHeaders.join(', ')}`,
      });
      console.error('Header validation failed:', missingHeaders);
    }

    // Process each data row
    for (let i = 1; i < lines.length; i++) {
      const rowNumber = i;
      const line = lines[i];
      console.log(`Processing row ${rowNumber}:`, line);

      try {
        const values = line.split(',').map(v => v.trim());

        // Check for correct number of columns
        if (values.length !== headers.length) {
          result.errorRows++;
          result.errors.push({
            row: rowNumber,
            type: 'column_count_mismatch',
            details: `Expected ${headers.length} columns but found ${values.length}`,
            data: line,
          });
          incrementErrorPattern(result, 'column_count_mismatch');
          continue;
        }

        // Validate each field
        let rowHasError = false;
        headers.forEach((header, index) => {
          const value = values[index];
          const error = validateField(header, value, rowNumber);
          if (error) {
            rowHasError = true;
            result.errors.push(error);
            incrementErrorPattern(result, error.type);
            if (!result.patterns.problematicColumns.includes(header)) {
              result.patterns.problematicColumns.push(header);
            }
          }
        });

        if (!rowHasError) {
          result.validRows++;
        } else {
          result.errorRows++;
        }

      } catch (error) {
        console.error(`Error processing row ${rowNumber}:`, error);
        result.errorRows++;
        result.errors.push({
          row: rowNumber,
          type: 'processing_error',
          details: error.message,
          data: line,
        });
        incrementErrorPattern(result, 'processing_error');
      }
    }

    // Final validation
    result.isValid = result.errorRows === 0;
    console.log('CSV analysis completed:', result);

  } catch (error) {
    console.error('Fatal error during CSV analysis:', error);
    result.isValid = false;
    result.errors.push({
      row: -1,
      type: 'fatal_error',
      details: error.message,
    });
    incrementErrorPattern(result, 'fatal_error');
  }

  return result;
};

const validateField = (header: string, value: string, rowNumber: number) => {
  console.log(`Validating field ${header} with value "${value}" in row ${rowNumber}`);
  
  if (!value) {
    return {
      row: rowNumber,
      type: 'missing_value',
      details: `Missing value for ${header}`,
    };
  }

  switch (header) {
    case 'violation_date':
      if (!isValidDate(value)) {
        return {
          row: rowNumber,
          type: 'invalid_date',
          details: `Invalid date format for ${header}: ${value}`,
        };
      }
      break;
    
    case 'fine_amount':
      if (!isValidNumber(value)) {
        return {
          row: rowNumber,
          type: 'invalid_number',
          details: `Invalid number format for ${header}: ${value}`,
        };
      }
      break;
    
    case 'violation_points':
      if (!isValidInteger(value)) {
        return {
          row: rowNumber,
          type: 'invalid_integer',
          details: `Invalid integer format for ${header}: ${value}`,
        };
      }
      break;
  }

  return null;
};

const isValidDate = (value: string): boolean => {
  const date = new Date(value);
  return date instanceof Date && !isNaN(date.getTime());
};

const isValidNumber = (value: string): boolean => {
  return !isNaN(parseFloat(value));
};

const isValidInteger = (value: string): boolean => {
  return !isNaN(parseInt(value)) && Number.isInteger(parseFloat(value));
};

const incrementErrorPattern = (result: CsvAnalysisResult, errorType: string) => {
  result.patterns.commonErrors[errorType] = (result.patterns.commonErrors[errorType] || 0) + 1;
};

export const generateErrorReport = (analysis: CsvAnalysisResult): string => {
  const sections = [
    `# Traffic Fines CSV Import Analysis Report\n`,
    `## Summary`,
    `- Total Rows: ${analysis.totalRows}`,
    `- Valid Rows: ${analysis.validRows}`,
    `- Error Rows: ${analysis.errorRows}`,
    `- Overall Status: ${analysis.isValid ? 'VALID' : 'INVALID'}\n`,
    
    `## Common Error Patterns`,
    Object.entries(analysis.patterns.commonErrors)
      .map(([type, count]) => `- ${type}: ${count} occurrences`)
      .join('\n'),
    
    `\n## Problematic Columns`,
    analysis.patterns.problematicColumns
      .map(column => `- ${column}`)
      .join('\n'),
    
    `\n## Detailed Errors`,
    analysis.errors
      .map(error => `Row ${error.row}: ${error.type} - ${error.details}`)
      .join('\n'),
    
    `\n## Recommendations`,
    generateRecommendations(analysis),
  ].join('\n');

  return sections;
};

const generateRecommendations = (analysis: CsvAnalysisResult): string => {
  const recommendations = [];

  if (analysis.patterns.commonErrors['header_mismatch']) {
    recommendations.push('- Ensure the CSV file contains all required headers in the correct format');
  }

  if (analysis.patterns.commonErrors['column_count_mismatch']) {
    recommendations.push('- Check for missing commas or extra commas in the CSV file');
    recommendations.push('- Ensure no fields contain unescaped commas');
  }

  if (analysis.patterns.commonErrors['invalid_date']) {
    recommendations.push('- Use the format YYYY-MM-DD for all dates');
  }

  if (analysis.patterns.commonErrors['invalid_number']) {
    recommendations.push('- Ensure all numeric values use dots (.) as decimal separators');
    recommendations.push('- Remove any currency symbols or special characters from numeric fields');
  }

  if (analysis.patterns.commonErrors['missing_value']) {
    recommendations.push('- Fill in all required fields before import');
    recommendations.push('- Use appropriate placeholder values for optional fields');
  }

  return recommendations.join('\n');
};
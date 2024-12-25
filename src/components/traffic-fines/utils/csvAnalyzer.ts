import { toast } from "@/hooks/use-toast";
import { parseCSVLine, validateHeaders } from './csvParser';
import { repairDate, repairNumeric, repairString, ensureColumnCount } from './dataRepair';

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
    repairs?: string[];
  }>;
  patterns: {
    commonErrors: Record<string, number>;
    problematicColumns: string[];
    dataTypeIssues: Record<string, number>;
  };
  repairedRows: Array<{
    rowNumber: number;
    repairs: string[];
    finalData: string[];
  }>;
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
    repairedRows: []
  };

  try {
    const lines = content.split('\n').filter(line => line.trim());
    result.totalRows = lines.length - 1;
    
    console.log(`Processing ${result.totalRows} data rows...`);

    // Validate headers
    const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
    const headerValidation = validateHeaders(headers);
    
    if (!headerValidation.isValid) {
      result.errors.push({
        row: 0,
        type: 'header_mismatch',
        details: `Missing required headers: ${headerValidation.missingHeaders.join(', ')}`,
      });
      console.error('Header validation failed:', headerValidation.missingHeaders);
    }

    // Process each data row
    for (let i = 1; i < lines.length; i++) {
      const rowNumber = i;
      const line = lines[i];
      console.log(`Processing row ${rowNumber}:`, line);

      try {
        const { values, repairs } = parseCSVLine(line);
        const columnResult = ensureColumnCount(values, headers.length);
        let rowRepairs = [...repairs, ...columnResult.repairs];
        let rowHasError = false;

        // Validate and repair each field
        headers.forEach((header, index) => {
          const value = columnResult.row[index];
          const repairResult = repairField(header, value, rowNumber);
          
          if (repairResult.error) {
            rowHasError = true;
            result.errors.push(repairResult.error);
            incrementErrorPattern(result, repairResult.error.type);
          }
          
          if (repairResult.wasRepaired) {
            columnResult.row[index] = repairResult.value;
            rowRepairs.push(`Column '${header}': ${repairResult.repairDetails}`);
          }
        });

        if (rowRepairs.length > 0) {
          result.repairedRows.push({
            rowNumber,
            repairs: rowRepairs,
            finalData: columnResult.row
          });
        }

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

    result.isValid = result.validRows > 0;
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

const repairField = (header: string, value: string, rowNumber: number): {
  value: string;
  wasRepaired: boolean;
  repairDetails?: string;
  error?: {
    row: number;
    type: string;
    details: string;
  };
} => {
  let repairResult;

  switch (header) {
    case 'violation_date':
      repairResult = repairDate(value);
      if (!repairResult.wasRepaired && !value) {
        return {
          value,
          wasRepaired: false,
          error: {
            row: rowNumber,
            type: 'invalid_date',
            details: `Invalid or missing date: ${value}`
          }
        };
      }
      break;
    
    case 'fine_amount':
    case 'violation_points':
      repairResult = repairNumeric(value);
      if (!repairResult.wasRepaired && !value) {
        return {
          value,
          wasRepaired: false,
          error: {
            row: rowNumber,
            type: 'invalid_number',
            details: `Invalid or missing number: ${value}`
          }
        };
      }
      break;
    
    default:
      repairResult = repairString(value);
      if (!repairResult.wasRepaired && !value) {
        return {
          value,
          wasRepaired: false,
          error: {
            row: rowNumber,
            type: 'missing_value',
            details: `Missing required value for ${header}`
          }
        };
      }
  }

  return repairResult;
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
    `- Repaired Rows: ${analysis.repairedRows.length}`,
    `- Overall Status: ${analysis.isValid ? 'VALID' : 'INVALID'}\n`,
    
    `## Data Repairs`,
    analysis.repairedRows.map(repair => 
      `Row ${repair.rowNumber}:\n${repair.repairs.map(r => `  - ${r}`).join('\n')}`
    ).join('\n\n'),
    
    `\n## Common Error Patterns`,
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
    recommendations.push('- Check for any regional date formats that need conversion');
  }

  if (analysis.patterns.commonErrors['invalid_number']) {
    recommendations.push('- Ensure all numeric values use dots (.) as decimal separators');
    recommendations.push('- Remove any currency symbols or special characters from numeric fields');
  }

  if (analysis.patterns.commonErrors['missing_value']) {
    recommendations.push('- Fill in all required fields before import');
    recommendations.push('- Use appropriate placeholder values for optional fields');
  }

  if (analysis.repairedRows.length > 0) {
    recommendations.push('- Review repaired data to ensure corrections are appropriate');
    recommendations.push('- Consider updating source data to prevent future repairs');
  }

  return recommendations.join('\n');
};
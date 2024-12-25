import { parseCSVLine, validateHeaders } from './csvParser';
import { ensureColumnCount, repairDate, repairNumeric } from './dataRepair';

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

const incrementErrorPattern = (result: CsvAnalysisResult, errorType: string) => {
  result.patterns.commonErrors[errorType] = (result.patterns.commonErrors[errorType] || 0) + 1;
};

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
        const repairedData = columnResult.row.map((value, index) => {
          const header = headers[index];
          const repairResult = repairField(header, value, rowNumber);
          
          if (repairResult.error) {
            rowHasError = true;
            result.errors.push(repairResult.error);
            incrementErrorPattern(result, repairResult.error.type);
          }
          
          if (repairResult.wasRepaired) {
            rowRepairs.push(`Column '${header}': ${repairResult.repairDetails}`);
            return repairResult.value;
          }
          
          return value;
        });

        if (rowRepairs.length > 0) {
          result.repairedRows.push({
            rowNumber,
            repairs: rowRepairs,
            finalData: repairedData
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
  switch (header) {
    case 'violation_date':
      const dateResult = repairDate(value);
      if (!dateResult.wasRepaired && !value) {
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
      return dateResult;
    
    case 'fine_amount':
    case 'violation_points':
      const numericResult = repairNumeric(value);
      if (!numericResult.wasRepaired && !value) {
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
      return numericResult;
    
    default:
      return {
        value: value.trim(),
        wasRepaired: false
      };
  }
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
      .join('\n')
  ].join('\n');

  return sections;
};
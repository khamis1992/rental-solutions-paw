import { CsvAnalysisResult, RepairResult } from './types';
import { incrementErrorPattern } from './errorPatterns';
import { parseCSVLine, validateHeaders } from './csvParser';
import { repairDate, repairNumeric } from './dataRepair';

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
    
    // Validate headers
    const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
    const headerValidation = validateHeaders(headers);
    
    if (!headerValidation.isValid) {
      result.errors.push({
        row: 0,
        type: 'header_mismatch',
        details: `Missing required headers: ${headerValidation.missingHeaders.join(', ')}`,
      });
    }

    // Process each data row
    for (let i = 1; i < lines.length; i++) {
      const rowNumber = i;
      const line = lines[i];
      
      try {
        // Parse the line into values
        const { values, repairs } = parseCSVLine(line);
        
        // Create a normalized row with exactly the expected number of columns
        const normalizedValues = [...values];
        
        // Add empty values for missing columns
        while (normalizedValues.length < headers.length) {
          normalizedValues.push('');
          repairs.push(`Added empty placeholder for column ${normalizedValues.length}`);
        }
        
        // Remove excess columns
        if (normalizedValues.length > headers.length) {
          const removed = normalizedValues.splice(headers.length);
          repairs.push(`Removed ${removed.length} excess columns`);
        }

        // Validate and repair each field
        const repairedData = normalizedValues.map((value, index) => {
          const header = headers[index];
          const repairResult = repairField(header, value, rowNumber);
          
          if (repairResult.error) {
            result.errors.push({
              row: rowNumber,
              type: repairResult.error.type,
              details: repairResult.error.details,
              data: value
            });
            incrementErrorPattern(result.patterns.commonErrors, repairResult.error.type);
          }
          
          return repairResult.value;
        });

        // Log the repairs if any were made
        if (repairs.length > 0) {
          result.repairedRows.push({
            rowNumber,
            repairs,
            finalData: repairedData,
            raw: line
          });
        }

        // Count as valid if we have all required fields with valid data
        result.validRows++;

      } catch (error: any) {
        console.error(`Error processing row ${rowNumber}:`, error);
        result.errorRows++;
        result.errors.push({
          row: rowNumber,
          type: 'processing_error',
          details: error.message,
          data: line,
        });
        incrementErrorPattern(result.patterns.commonErrors, 'processing_error');
      }
    }

    // Consider the import valid if we have at least one valid row
    result.isValid = result.validRows > 0;

  } catch (error: any) {
    console.error('Fatal error during CSV analysis:', error);
    result.isValid = false;
    result.errors.push({
      row: -1,
      type: 'fatal_error',
      details: error.message,
    });
  }

  return result;
};

const repairField = (header: string, value: string, rowNumber: number): RepairResult => {
  switch (header) {
    case 'violation_date':
      return repairDate(value);
    case 'fine_amount':
    case 'violation_points':
      return repairNumeric(value);
    default:
      return {
        value: value.trim(),
        wasRepaired: false
      };
  }
};

export { generateErrorReport } from './errorPatterns';
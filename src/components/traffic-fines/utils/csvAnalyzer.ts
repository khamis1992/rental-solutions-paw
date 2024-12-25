import { CsvAnalysisResult, RepairResult } from './types';
import { incrementErrorPattern } from './errorPatterns';
import { repairQuotes, repairDelimiters } from './repairUtils';
import { parseCSVLine, validateHeaders } from './csvParser';
import { ensureColumnCount, repairDate, repairNumeric } from './dataRepair';

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
      let line = lines[i];

      // Apply repairs
      const quoteRepair = repairQuotes(line);
      const delimiterRepair = repairDelimiters(quoteRepair.value);
      
      const repairs = [...quoteRepair.repairs, ...delimiterRepair.repairs];
      line = delimiterRepair.value;

      try {
        const { values, repairs: parseRepairs } = parseCSVLine(line);
        const columnResult = ensureColumnCount(values, headers.length);
        
        let rowRepairs = [...repairs, ...parseRepairs, ...columnResult.repairs];
        let rowHasError = false;

        // Validate and repair each field
        const repairedData = columnResult.row.map((value, index) => {
          const header = headers[index];
          const repairResult = repairField(header, value, rowNumber);
          
          if (repairResult.error) {
            rowHasError = true;
            result.errors.push({
              row: rowNumber,
              type: repairResult.error.type,
              details: repairResult.error.details,
              data: value
            });
            incrementErrorPattern(result.patterns.commonErrors, repairResult.error.type);
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

    result.isValid = result.validRows > 0;

  } catch (error: any) {
    console.error('Fatal error during CSV analysis:', error);
    result.isValid = false;
    result.errors.push({
      row: -1,
      type: 'fatal_error',
      details: error.message,
    });
    incrementErrorPattern(result.patterns.commonErrors, 'fatal_error');
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
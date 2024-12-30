import { CsvAnalysisResult } from './types';
import { incrementErrorPattern } from './errorPatterns';
import { parseCSVLine, validateHeaders, reconstructMalformedRow } from './csvParser';

export const analyzeCsvContent = (content: string, requiredHeaders: string[]): CsvAnalysisResult => {
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
    // Split content into lines and filter out empty lines
    const lines = content.split('\n').filter(line => line.trim());
    result.totalRows = lines.length - 1; // Exclude header row
    
    // Validate headers
    const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
    const headerValidation = validateHeaders(headers, requiredHeaders);
    
    if (!headerValidation.isValid) {
      result.errors.push({
        row: 0,
        type: 'header_mismatch',
        details: `Missing required headers: ${headerValidation.missingHeaders.join(', ')}`,
      });
      result.isValid = false;
      return result;
    }

    // Process each data row
    for (let i = 1; i < lines.length; i++) {
      try {
        const rowNumber = i;
        let line = lines[i];
        const repairs: string[] = [];

        // Parse the line into values
        const parseResult = parseCSVLine(line);
        
        // Try to reconstruct malformed rows
        if (parseResult.values.length !== requiredHeaders.length && i + 1 < lines.length) {
          const reconstruction = reconstructMalformedRow(
            parseResult.values,
            lines[i + 1],
            requiredHeaders.length
          );
          
          if (reconstruction.skipNextRow) {
            i++; // Skip the next row as it was merged
            repairs.push(...reconstruction.repairs);
            parseResult.values = reconstruction.repairedRow;
          } else {
            // If reconstruction didn't work, pad or trim as needed
            while (parseResult.values.length < requiredHeaders.length) {
              parseResult.values.push('');
              repairs.push(`Added empty value for missing column ${parseResult.values.length}`);
            }
            if (parseResult.values.length > requiredHeaders.length) {
              const removed = parseResult.values.splice(requiredHeaders.length);
              repairs.push(`Removed ${removed.length} excess columns`);
            }
          }
        }

        // Log the repairs if any were made
        if (repairs.length > 0 || parseResult.repairs.length > 0) {
          result.repairedRows.push({
            rowNumber,
            repairs: [...repairs, ...parseResult.repairs],
            finalData: parseResult.values,
            raw: line
          });
        }

        // Count as valid if we have the correct number of columns after repairs
        if (parseResult.values.length === requiredHeaders.length) {
          result.validRows++;
        } else {
          result.errorRows++;
          const errorDetails = `Row has ${parseResult.values.length} columns but expected ${requiredHeaders.length}`;
          result.errors.push({
            row: i,
            type: 'column_count_mismatch',
            details: errorDetails,
            data: line,
          });
          incrementErrorPattern(
            result.patterns.commonErrors,
            'column_count_mismatch',
            `Row ${i}: ${errorDetails}`,
            line
          );
        }

      } catch (error: any) {
        console.error(`Error processing row ${i}:`, error);
        result.errorRows++;
        const errorDetails = error.message || 'Unknown error';
        result.errors.push({
          row: i,
          type: 'processing_error',
          details: errorDetails,
          data: lines[i],
        });
        incrementErrorPattern(
          result.patterns.commonErrors,
          'processing_error',
          `Row ${i}: ${errorDetails}`,
          lines[i]
        );
      }
    }

    // Consider the import valid if we have at least one valid row
    result.isValid = result.validRows > 0;
    console.log('Analysis complete:', result);

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

export { generateErrorReport } from './errorPatterns';
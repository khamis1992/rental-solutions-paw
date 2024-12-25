export interface ErrorPattern {
  type: string;
  count: number;
  examples: string[];
}

export const incrementErrorPattern = (
  patterns: Record<string, ErrorPattern>,
  type: string,
  example: string,
  data: string
) => {
  if (!patterns[type]) {
    patterns[type] = {
      type,
      count: 0,
      examples: []
    };
  }
  
  patterns[type].count++;
  if (patterns[type].examples.length < 3) { // Keep only first 3 examples
    patterns[type].examples.push(example);
  }
};

export const generateErrorReport = (analysis: any): string => {
  if (!analysis || !analysis.errors || !analysis.errors.length) {
    return 'No errors to report';
  }

  let report = 'CSV Analysis Report:\n\n';
  
  // Add summary
  report += `Total Rows: ${analysis.totalRows}\n`;
  report += `Valid Rows: ${analysis.validRows}\n`;
  report += `Error Rows: ${analysis.errorRows}\n`;
  report += `Repaired Rows: ${analysis.repairedRows.length}\n\n`;

  // Group errors by type
  const errorsByType: Record<string, number> = {};
  analysis.errors.forEach((error: any) => {
    errorsByType[error.type] = (errorsByType[error.type] || 0) + 1;
  });

  // Add error type summary
  report += 'Error Summary:\n';
  Object.entries(errorsByType).forEach(([type, count]) => {
    report += `${type}: ${count} occurrences\n`;
  });

  // Add detailed error list
  report += '\nDetailed Errors:\n';
  analysis.errors.forEach((error: any, index: number) => {
    report += `\nError ${index + 1}:\n`;
    report += `Row: ${error.row}\n`;
    report += `Type: ${error.type}\n`;
    report += `Details: ${error.details}\n`;
    if (error.data) {
      report += `Data: ${error.data}\n`;
    }
  });

  // Add repair summary if available
  if (analysis.repairedRows?.length > 0) {
    report += '\nRepaired Rows:\n';
    analysis.repairedRows.forEach((repair: any) => {
      report += `\nRow ${repair.rowNumber}:\n`;
      repair.repairs.forEach((r: string) => report += `- ${r}\n`);
    });
  }

  return report;
};
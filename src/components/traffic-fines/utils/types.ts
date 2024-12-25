export interface CsvAnalysisResult {
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

export interface ErrorPattern {
  type: string;
  count: number;
  examples: string[];
}
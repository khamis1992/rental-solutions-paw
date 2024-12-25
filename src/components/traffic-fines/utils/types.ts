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
  }>;
  patterns: {
    commonErrors: Record<string, ErrorPattern>;
    problematicColumns: string[];
    dataTypeIssues: Record<string, number>;
  };
  repairedRows: Array<{
    rowNumber: number;
    repairs: string[];
    finalData: string[];
    raw: string;
  }>;
}

export interface ErrorPattern {
  type: string;
  count: number;
  examples: string[];
}

export interface ParseResult {
  values: string[];
  repairs: string[];
}
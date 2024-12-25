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
    commonErrors: Record<string, ErrorPattern>;
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

export interface RepairResult {
  value: string;
  wasRepaired: boolean;
  repairDetails?: string;
  error?: {
    type: string;
    details: string;
  };
}
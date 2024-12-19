export interface ImportErrors {
  skipped: Array<{
    row: number;
    data: Record<string, any>;
    reason: string;
  }>;
  failed: Array<{
    row: number;
    data?: Record<string, any>;
    error: string;
  }>;
}

export interface ImportLog {
  status: string;
  records_processed: number;
  errors: ImportErrors;
}
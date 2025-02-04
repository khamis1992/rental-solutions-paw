export interface ReportSchedule {
  id?: string;
  report_type: string;
  frequency: string;
  recipients: string[];
  format: string;
  last_run_at?: string;
  next_run_at?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}
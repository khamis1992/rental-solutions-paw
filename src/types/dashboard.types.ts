export interface DashboardStats {
  total_vehicles: number;
  available_vehicles: number;
  rented_vehicles: number;
  maintenance_vehicles: number;
  total_customers: number;
  active_rentals: number;
  monthly_revenue: number;
}

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
export type MaintenanceStatus = 'cancelled' | 'scheduled' | 'in_progress' | 'completed' | 'accident' | 'urgent';

export interface MaintenanceRecord {
  id: string;
  vehicle_id: string;
  service_type: string;
  description?: string;
  status: MaintenanceStatus;
  cost?: number;
  scheduled_date: string;
  completed_date?: string;
  performed_by?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  category_id?: string;
}
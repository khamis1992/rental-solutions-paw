
export type MaintenanceStatus = 'cancelled' | 'completed' | 'scheduled' | 'in_progress' | 'urgent' | 'accident';

export interface MaintenanceRecord {
  id: string;
  vehicle_id: string;
  service_type: string;
  description?: string;
  status: MaintenanceStatus;
  cost?: number;
  scheduled_date: string;
  completed_date?: string | null;
  notes?: string;
  category_id?: string;
  created_at: string;
  updated_at: string;
}

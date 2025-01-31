export type MaintenanceStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'accident';

export interface Maintenance {
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
  category_id?: string;
  created_at: string;
  updated_at: string;
  vehicles?: {
    make: string;
    model: string;
    year: number;
    license_plate: string;
  };
}
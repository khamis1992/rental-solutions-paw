export interface MaintenanceRecord {
  id: string;
  vehicle_id: string;
  service_type: string;
  description: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  cost: number;
  scheduled_date: string;
  completed_date?: string;
  performed_by?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  category_id?: string;
  vehicles: {
    id: string;
    make: string;
    model: string;
    year: number;
    license_plate: string;
  };
}
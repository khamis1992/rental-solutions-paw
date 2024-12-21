import { Database } from "@/integrations/supabase/types";

export type MaintenanceStatus = Database['public']['Enums']['maintenance_status'];

export interface Maintenance {
  id: string;
  vehicle_id: string;
  service_type: string;
  description: string | null;
  status: MaintenanceStatus;
  cost: number | null;
  scheduled_date: string;
  completed_date: string | null;
  performed_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  category_id: string | null;
}

export interface VehicleInspection {
  id: string;
  vehicle_id: string;
  lease_id: string | null;
  inspection_type: string;
  inspection_date: string;
  photos: string[] | null;
  detected_damages: Record<string, any> | null;
  damage_severity: string | null;
  ai_confidence_score: number | null;
  inspector_notes: string | null;
  odometer_reading: number | null;
  fuel_level: number | null;
  renter_signature: string | null;
  staff_signature: string | null;
  damage_markers: Record<string, any> | null;
}

export interface MaintenanceDocument {
  id: string;
  maintenance_id: string | null;
  document_type: string;
  document_url: string;
  uploaded_by: string | null;
  created_at: string | null;
  updated_at: string | null;
}
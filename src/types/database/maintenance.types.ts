import { Database } from "./database.types";

export type MaintenanceStatus = Database['public']['Enums']['maintenance_status'];

export interface Maintenance {
  id: string;
  vehicle_id: string;
  service_type: string;
  description: string | null;
  status: MaintenanceStatus | null;
  cost: number | null;
  scheduled_date: string;
  completed_date: string | null;
  performed_by: string | null;
  notes: string | null;
  category_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceCategory {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
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

export interface MaintenancePrediction {
  id: string;
  vehicle_id: string;
  prediction_type: string;
  predicted_date: string | null;
  confidence_score: number | null;
  predicted_issues: string[] | null;
  recommended_services: string[] | null;
  estimated_cost: number | null;
  priority: string | null;
  ai_model: string | null;
  ai_analysis_details: Record<string, any> | null;
  created_at: string | null;
  updated_at: string | null;
}
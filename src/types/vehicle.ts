import { Database } from "@/integrations/supabase/types";

export type VehicleStatus = Database['public']['Enums']['vehicle_status'];

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  color: string | null;
  license_plate: string;
  vin: string;
  status: VehicleStatus;
  mileage: number;
  image_url: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
  location: string | null;
  insurance_company: string | null;
}

export interface VehicleDocument {
  id: string;
  vehicle_id: string;
  document_type: string;
  document_url: string;
  uploaded_by: string | null;
  expiry_date: string | null;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface VehicleInsurance {
  id: string;
  vehicle_id: string;
  policy_number: string;
  provider: string;
  coverage_type: string;
  coverage_amount: number;
  premium_amount: number;
  start_date: string;
  end_date: string;
  status: string;
}
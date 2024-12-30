import { Database } from "./database.types";

export type VehicleStatus = Database['public']['Enums']['vehicle_status'];

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  color: string | null;
  license_plate: string;
  vin: string;
  status: VehicleStatus | null;
  mileage: number | null;
  image_url: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
  is_test_data?: boolean;
}

export interface VehicleDocument {
  id: string;
  vehicle_id: string;
  document_type: string;
  document_url: string;
  uploaded_by: string | null;
  expiry_date: string | null;
  is_verified: boolean | null;
  created_at: string | null;
  updated_at: string | null;
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
  status: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface VehiclePart {
  id: string;
  vehicle_id: string | null;
  maintenance_id: string | null;
  part_name: string;
  part_number: string | null;
  quantity: number;
  unit_cost: number | null;
  status: string | null;
  supplier: string | null;
  created_at: string | null;
  updated_at: string | null;
}
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
  is_test_data?: boolean;
}
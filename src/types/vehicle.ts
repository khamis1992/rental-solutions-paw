export type VehicleStatus = 'available' | 'rented' | 'maintenance' | 'retired' | 'police_station' | 'accident' | 'reserve' | 'stolen';

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  color?: string;
  license_plate: string;
  vin: string;
  status: VehicleStatus;
  mileage: number;
  image_url?: string;
  description?: string;
  created_at: string;
  updated_at: string;
  is_test_data?: boolean;
  location?: string;
  insurance_company?: string;
}

export interface VehicleFilters {
  status: VehicleStatus;
  searchQuery?: string;
}
export type VehicleStatus = 'maintenance' | 'available' | 'rented' | 'retired' | 'police_station' | 'accident' | 'reserve' | 'stolen';

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  color?: string;
  license_plate: string;
  vin: string;
  status: VehicleStatus;
  mileage?: number;
  image_url?: string;
  description?: string;
  created_at: string;
  updated_at: string;
  location?: string;
  insurance_company?: string;
}

export interface VehicleFilters {
  status: VehicleStatus;
  searchQuery: string;
}

export interface VehicleDetailsDialogProps {
  vehicleId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface DeleteVehicleDialogProps {
  vehicleId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
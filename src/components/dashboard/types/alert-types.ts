export interface VehicleDetails {
  id: string;
  make: string;
  model: string;
  year: number;
  license_plate: string;
}

export interface CustomerDetails {
  full_name: string;
  phone_number: string;
}

export interface AlertDetails {
  type: 'vehicle' | 'payment' | 'maintenance';
  title: string;
  vehicle?: VehicleDetails;
  customer?: CustomerDetails;
  id: string;
}
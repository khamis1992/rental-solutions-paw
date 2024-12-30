export interface TrafficFine {
  id: string;
  lease_id?: string | null;
  serial_number?: string | null;
  violation_number?: string | null;
  violation_date: string;
  license_plate?: string | null;
  fine_location?: string | null;
  violation_charge?: string | null;
  fine_amount: number;
  violation_points?: number | null;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  assignment_status: 'pending' | 'assigned';
  created_at?: string | null;
  updated_at?: string | null;
  fine_type?: string | null;
  lease?: {
    id: string;
    customer_id: string;
    customer: {
      id: string;
      full_name: string;
    };
    vehicle: {
      make: string;
      model: string;
      year: number;
      license_plate: string;
    };
  } | null;
}
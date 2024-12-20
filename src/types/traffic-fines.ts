export interface TrafficFine {
  id: string;
  lease_id?: string;
  vehicle_id?: string;
  violation_date: string;
  fine_amount: number;
  fine_type: string;
  fine_location?: string | null;
  fine_reference?: string | null;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  serial_number?: string | null;
  violation_number?: string | null;
  violation_points?: number | null;
  violation_charge?: string | null;
  import_batch_id?: string | null;
  assignment_status: 'pending' | 'assigned';
  assignment_notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  lease?: {
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
  };
}

export interface AISuggestion {
  agreement: {
    id: string;
    customer: {
      id: string;
      full_name: string;
    };
    vehicle: {
      make: string;
      model: string;
      license_plate: string;
    };
    start_date: string;
    end_date: string;
  };
  isRecommended: boolean;
  confidence: number;
  explanation?: string;
}
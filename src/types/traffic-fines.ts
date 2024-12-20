export interface TrafficFine {
  id: string;
  lease_id?: string;
  vehicle_id?: string;
  violation_date: Date;
  fine_amount: number;
  fine_type: string;
  fine_location?: string;
  fine_reference?: string;
  payment_status: 'pending' | 'completed';
  serial_number?: string;
  violation_number?: string;
  violation_points?: number;
  violation_charge?: string;
  import_batch_id?: string;
  assignment_status: 'pending' | 'assigned';
  assignment_notes?: string;
  created_at?: Date;
  updated_at?: Date;
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
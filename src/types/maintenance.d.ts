export interface AnomalyRecord {
  id: string;
  detection_type: string;
  severity: string;
  description: string;
  affected_records: {
    vehicle_id: string;
    license_plate: string;
    mileage: number;
  };
  detected_at: string;
  resolved_at?: string;
  resolution_notes?: string;
  false_positive: boolean;
}
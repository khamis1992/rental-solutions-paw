export interface AgreementWithRelations extends Agreement {
  customer?: {
    id: string;
    full_name: string | null;
    phone_number: string | null;
  };
  vehicle?: {
    id: string;
    make: string;
    model: string;
    year: number;
    license_plate: string;
  };
  remainingAmount?: number;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  agreement_type: "short_term" | "lease_to_own";
  rent_amount: number;
  final_price: number;
  agreement_duration: string;
  daily_late_fee?: number;
  damage_penalty_rate?: number;
  late_return_fee?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  content?: string;
  language?: "english" | "arabic";
  template_structure?: Record<string, any>;
  template_sections?: any[];
  variable_mappings?: Record<string, any>;
}

export type DocumentLanguage = "english" | "arabic";
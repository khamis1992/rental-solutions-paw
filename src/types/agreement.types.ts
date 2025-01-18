export type LeaseStatus = 'active' | 'pending_payment' | 'pending_deposit' | 'closed' | 'terminated' | 'cancelled';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type DocumentLanguage = 'english' | 'spanish' | 'french' | 'arabic';

export interface Template {
  id: string;
  name: string;
  description?: string;
  agreement_type?: "lease_to_own" | "short_term";
  rent_amount?: number;
  final_price?: number;
  agreement_duration?: string;
  daily_late_fee?: number;
  damage_penalty_rate?: number;
  late_return_fee?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  content: string;
  language: DocumentLanguage;
  template_structure?: Record<string, any>;
  template_sections?: any[];
  variable_mappings?: Record<string, any>;
}

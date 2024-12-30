export type LegalCaseStatus = 
  | "pending_reminder"
  | "in_legal_process"
  | "escalated"
  | "resolved";

export interface LegalCase {
  id: string;
  customer_id: string;
  case_type: string;
  status: LegalCaseStatus;
  amount_owed: number;
  description: string;
  priority: string;
  assigned_to: string;
  last_reminder_sent: string;
  reminder_count: number;
  escalation_date: string;
  resolution_date: string;
  resolution_notes: string;
  created_at: string;
  updated_at: string;
  customer: {
    full_name: string;
    phone_number: string;
    email: string;
    address: string;
  };
}
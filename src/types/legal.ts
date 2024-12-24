export type LegalCaseStatus = 'pending_reminder' | 'pending_review' | 'in_progress' | 'resolved' | 'closed';

export interface LegalCase {
  id: string;
  customer_id: string;
  case_type: string;
  status: LegalCaseStatus;
  amount_owed: number;
  description: string;
  priority: string;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}
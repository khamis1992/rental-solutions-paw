export type LegalCaseStatus = 'pending_reminder' | 'in_legal_process' | 'resolved' | 'escalated';

export interface LegalCase {
  id: string;
  customer_id: string;
  case_type: string;
  status: LegalCaseStatus;
  amount_owed: number;
  description?: string;
  priority?: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  customer: {
    full_name: string;
  };
  assigned_to_user?: {
    full_name: string;
  };
}

export interface ViewLegalCaseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  caseId: string;
  currentStatus: LegalCaseStatus;
  notes: string;
  onStatusUpdate: () => void;
}
export interface WorkflowStep {
  id: string;
  name: string;
  type: string;
  config: Record<string, any>;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  triggers: any[];
  is_active: boolean;
}

export interface WorkflowTemplateRow extends WorkflowTemplate {
  created_at: string;
  created_by: string | null;
  updated_at: string;
}
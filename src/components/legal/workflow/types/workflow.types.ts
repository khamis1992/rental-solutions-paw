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
  created_by: string;
  created_at: string;
  updated_at: string;
}

export type WorkflowTemplateRow = WorkflowTemplate;
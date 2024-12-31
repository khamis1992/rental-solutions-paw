import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WorkflowTemplate, WorkflowTemplateRow } from "../types/workflow.types";

export const useWorkflowTemplates = () => {
  return useQuery({
    queryKey: ["workflow-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workflow_templates")
        .select("*");
      if (error) throw error;
      
      // Transform database rows to WorkflowTemplate type
      return (data as WorkflowTemplateRow[]).map(row => ({
        ...row,
        steps: Array.isArray(row.steps) ? row.steps.map((step: any) => ({
          id: step.id || crypto.randomUUID(),
          name: step.name || '',
          type: step.type || 'task',
          config: step.config || {}
        })) : [],
        triggers: Array.isArray(row.triggers) ? row.triggers : []
      })) as WorkflowTemplate[];
    },
  });
};
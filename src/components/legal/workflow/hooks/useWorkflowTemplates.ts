import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WorkflowTemplate } from "../types/workflow.types";

export const useWorkflowTemplates = () => {
  return useQuery({
    queryKey: ["workflow-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workflow_templates")
        .select("*");

      if (error) {
        console.error("Error fetching workflow templates:", error);
        throw error;
      }

      // Parse the JSON fields
      const templates = data.map(template => ({
        ...template,
        steps: JSON.parse(template.steps as string),
        triggers: JSON.parse(template.triggers as string)
      })) as WorkflowTemplate[];

      return templates;
    }
  });
};
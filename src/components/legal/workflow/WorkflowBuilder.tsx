import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { WorkflowForm } from "./components/WorkflowForm";
import { ExistingWorkflows } from "./components/ExistingWorkflows";
import { useWorkflowTemplates } from "./hooks/useWorkflowTemplates";
import { WorkflowStep } from "./types/workflow.types";

export const WorkflowBuilder = () => {
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const queryClient = useQueryClient();
  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const { data: templates, isLoading } = useWorkflowTemplates();

  const createMutation = useMutation({
    mutationFn: async (template: Omit<WorkflowTemplate, 'id'>) => {
      const { data, error } = await supabase
        .from("workflow_templates")
        .insert([{
          name: template.name,
          description: template.description,
          steps: template.steps as any,
          triggers: template.triggers,
          is_active: true,
        }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflow-templates"] });
      toast.success("Workflow template created successfully");
      form.reset();
      setSteps([]);
    },
    onError: (error) => {
      console.error("Error creating workflow template:", error);
      toast.error("Failed to create workflow template");
    },
  });

  const handleSubmit = (values: any) => {
    createMutation.mutate({
      name: values.name,
      description: values.description,
      steps,
      triggers: [],
      is_active: true,
    });
  };

  return (
    <div className="space-y-6">
      <WorkflowForm
        form={form}
        steps={steps}
        setSteps={setSteps}
        isSubmitting={createMutation.isPending}
        onSubmit={handleSubmit}
      />
      <ExistingWorkflows templates={templates} isLoading={isLoading} />
    </div>
  );
};
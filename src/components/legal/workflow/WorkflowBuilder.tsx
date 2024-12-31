import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Save, List, ListCheck } from "lucide-react";
import { toast } from "sonner";

interface WorkflowStep {
  id: string;
  name: string;
  type: string;
  config: Record<string, any>;
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  triggers: any[];
  is_active: boolean;
}

// Type for database row
interface WorkflowTemplateRow {
  id: string;
  name: string;
  description: string;
  steps: any;
  triggers: any;
  is_active: boolean;
  created_at: string;
  created_by: string | null;
  updated_at: string;
}

export const WorkflowBuilder = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const queryClient = useQueryClient();

  const { data: templates, isLoading } = useQuery({
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
      setName("");
      setDescription("");
      setSteps([]);
    },
    onError: (error) => {
      console.error("Error creating workflow template:", error);
      toast.error("Failed to create workflow template");
    },
  });

  const addStep = () => {
    const newStep: WorkflowStep = {
      id: crypto.randomUUID(),
      name: `Step ${steps.length + 1}`,
      type: "task",
      config: {},
    };
    setSteps([...steps, newStep]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      name,
      description,
      steps,
      triggers: [],
      is_active: true,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <List className="h-5 w-5" />
            Workflow Builder
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                placeholder="Workflow Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <Textarea
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="space-y-4">
              {steps.map((step, index) => (
                <Card key={step.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2">
                      <ListCheck className="h-4 w-4" />
                      <Input
                        value={step.name}
                        onChange={(e) => {
                          const newSteps = [...steps];
                          newSteps[index].name = e.target.value;
                          setSteps(newSteps);
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button type="button" variant="outline" onClick={addStep}>
                <Plus className="h-4 w-4 mr-2" />
                Add Step
              </Button>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={createMutation.isPending}>
                <Save className="h-4 w-4 mr-2" />
                Save Workflow
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Workflows</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Loading workflows...</div>
          ) : (
            <div className="space-y-4">
              {templates?.map((template) => (
                <Card key={template.id}>
                  <CardContent className="pt-4">
                    <h3 className="font-medium">{template.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {template.description}
                    </p>
                    <div className="mt-2">
                      <span className="text-sm">
                        {template.steps.length} steps
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
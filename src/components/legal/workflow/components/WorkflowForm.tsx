import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { List, ListCheck, Plus, Save } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { WorkflowStep } from "../types/workflow.types";

interface WorkflowFormProps {
  form: UseFormReturn<any>;
  steps: WorkflowStep[];
  setSteps: (steps: WorkflowStep[]) => void;
  isSubmitting: boolean;
  onSubmit: (values: any) => void;
}

export const WorkflowForm = ({ 
  form, 
  steps, 
  setSteps, 
  isSubmitting, 
  onSubmit 
}: WorkflowFormProps) => {
  const addStep = () => {
    const newStep: WorkflowStep = {
      id: crypto.randomUUID(),
      name: `Step ${steps.length + 1}`,
      type: "task",
      config: {},
    };
    setSteps([...steps, newStep]);
  };

  return (
    <Card>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Input
                placeholder="Workflow Name"
                {...form.register("name")}
                required
              />
            </div>
            <div>
              <Textarea
                placeholder="Description"
                {...form.register("description")}
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
              <Button type="submit" disabled={isSubmitting}>
                <Save className="h-4 w-4 mr-2" />
                Save Workflow
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
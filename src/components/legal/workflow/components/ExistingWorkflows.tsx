import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkflowTemplate } from "../types/workflow.types";

interface ExistingWorkflowsProps {
  templates: WorkflowTemplate[] | undefined;
  isLoading: boolean;
}

export const ExistingWorkflows = ({ templates, isLoading }: ExistingWorkflowsProps) => {
  return (
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
  );
};
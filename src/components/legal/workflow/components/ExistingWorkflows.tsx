import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { WorkflowTemplate } from "../types/workflow.types";

interface ExistingWorkflowsProps {
  templates: WorkflowTemplate[];
  isLoading: boolean;
  onTemplateSelect: (template: WorkflowTemplate) => void;
  selectedTemplateId?: string;
}

export function ExistingWorkflows({ 
  templates, 
  isLoading, 
  onTemplateSelect,
  selectedTemplateId 
}: ExistingWorkflowsProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Existing Workflows</h3>
        <div className="space-y-2">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Existing Workflows</h3>
      {templates.length === 0 ? (
        <Card className="p-6 text-center text-muted-foreground">
          No workflows created yet
        </Card>
      ) : (
        <div className="space-y-2">
          {templates.map((template) => (
            <Card 
              key={template.id}
              className={`p-4 cursor-pointer transition-colors hover:bg-muted/50 ${
                selectedTemplateId === template.id ? 'border-primary' : ''
              }`}
              onClick={() => onTemplateSelect(template)}
            >
              <h4 className="font-medium">{template.name}</h4>
              <p className="text-sm text-muted-foreground">{template.description}</p>
              <div className="mt-2 text-xs text-muted-foreground">
                Steps: {template.steps.length} | Last updated: {new Date(template.updated_at).toLocaleDateString()}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { useWorkflowTemplates } from "./hooks/useWorkflowTemplates";
import { WorkflowForm } from "./components/WorkflowForm";
import { ExistingWorkflows } from "./components/ExistingWorkflows";
import { WorkflowTemplate } from "./types/workflow.types";

export function WorkflowBuilder() {
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null);
  const { data: templates, isLoading } = useWorkflowTemplates();

  const handleTemplateSelect = (template: WorkflowTemplate) => {
    setSelectedTemplate(template);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-4">Workflow Builder</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WorkflowForm 
            selectedTemplate={selectedTemplate}
            onTemplateSelect={handleTemplateSelect}
          />
          <ExistingWorkflows
            templates={templates || []}
            isLoading={isLoading}
            onTemplateSelect={handleTemplateSelect}
            selectedTemplateId={selectedTemplate?.id}
          />
        </div>
      </Card>
    </div>
  );
}
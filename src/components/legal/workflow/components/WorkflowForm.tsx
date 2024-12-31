import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { WorkflowTemplate } from "../types/workflow.types";

interface WorkflowFormProps {
  selectedTemplate: WorkflowTemplate | null;
  onTemplateSelect: (template: WorkflowTemplate | null) => void;
}

export function WorkflowForm({ selectedTemplate, onTemplateSelect }: WorkflowFormProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Create New Workflow</h3>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Name</label>
          <Input 
            placeholder="Enter workflow name"
            value={selectedTemplate?.name || ''}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Description</label>
          <Textarea 
            placeholder="Enter workflow description"
            value={selectedTemplate?.description || ''}
          />
        </div>
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={() => onTemplateSelect(null)}
          >
            Cancel
          </Button>
          <Button>
            Save Workflow
          </Button>
        </div>
      </div>
    </div>
  );
}
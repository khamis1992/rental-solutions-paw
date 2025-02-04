import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface TemplatePreviewProps {
  content: string;
  missingVariables?: string[];
}

export const TemplatePreview = ({ content, missingVariables = [] }: TemplatePreviewProps) => {
  return (
    <div className="space-y-4">
      {missingVariables.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            The following variables are missing: {missingVariables.join(", ")}
          </AlertDescription>
        </Alert>
      )}
      
      <ScrollArea className="h-[400px] w-full rounded-md border p-4">
        <div className="whitespace-pre-wrap font-mono text-sm">
          {content}
        </div>
      </ScrollArea>
    </div>
  );
};
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { useDocumentGeneration } from "./hooks/useDocumentGeneration";

interface GenerateDocumentButtonProps {
  templateId: string;
  caseId?: string;
  onGenerated?: (documentId: string) => void;
  className?: string;
}

export function GenerateDocumentButton({ 
  templateId, 
  caseId,
  onGenerated,
  className 
}: GenerateDocumentButtonProps) {
  const { generateDocument, isGenerating } = useDocumentGeneration();

  const handleGenerate = async () => {
    try {
      // Example variables - you would typically get these from a form or context
      const variables = {
        date: new Date().toLocaleDateString(),
        caseNumber: "CASE-" + Math.random().toString(36).substr(2, 9),
        // Add other variables as needed
      };

      const result = await generateDocument({
        templateId,
        variables,
        caseId
      });

      if (result?.documentId && onGenerated) {
        onGenerated(result.documentId);
      }
    } catch (error) {
      // Error is handled by the hook
      console.error('Failed to generate document:', error);
    }
  };

  return (
    <Button
      onClick={handleGenerate}
      disabled={isGenerating}
      className={className}
    >
      <FileText className="mr-2 h-4 w-4" />
      {isGenerating ? 'Generating...' : 'Generate Document'}
    </Button>
  );
}
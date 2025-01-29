import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface TemplatePreviewProps {
  content: string;
  missingVariables?: string[];
}

export const TemplatePreview = ({ content, missingVariables = [] }: TemplatePreviewProps) => {
  // Check if content contains Arabic text
  const containsArabic = (text: string) => {
    const arabicPattern = /[\u0600-\u06FF]/;
    return arabicPattern.test(text);
  };

  const isArabic = containsArabic(content);

  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle>Template Preview</DialogTitle>
      </DialogHeader>
      
      {missingVariables.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            The following variables are missing: {missingVariables.join(", ")}
          </AlertDescription>
        </Alert>
      )}
      
      <ScrollArea className="h-[400px] w-full rounded-md border p-6">
        <div 
          className={`whitespace-pre-wrap font-mono text-base leading-relaxed ${
            isArabic ? 'text-right rtl' : 'text-left ltr'
          }`}
          style={{
            direction: isArabic ? 'rtl' : 'ltr',
            fontFamily: isArabic ? 'Noto Sans Arabic, sans-serif' : 'monospace'
          }}
        >
          {/* Format the content with proper spacing */}
          {content.split('\n').map((line, index) => (
            <div 
              key={index} 
              className={`mb-2 ${
                line.trim().startsWith('{{') ? 'text-primary font-semibold' : ''
              }`}
            >
              {line}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
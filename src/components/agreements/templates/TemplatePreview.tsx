import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

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
    <div className="space-y-6">
      <DialogHeader>
        <DialogTitle className="text-xl font-semibold">
          {isArabic ? "معاينة النموذج" : "Template Preview"}
        </DialogTitle>
      </DialogHeader>
      
      {missingVariables.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {isArabic ? 
              "المتغيرات التالية مفقودة: " + missingVariables.join("، ") :
              "The following variables are missing: " + missingVariables.join(", ")
            }
          </AlertDescription>
        </Alert>
      )}
      
      <ScrollArea className="h-[500px] w-full rounded-md border bg-white shadow-sm">
        <div 
          className={cn(
            "p-8",
            isArabic ? "text-right font-arabic" : "text-left",
            "text-base leading-relaxed"
          )}
          style={{
            direction: isArabic ? 'rtl' : 'ltr',
          }}
        >
          {content.split('\n').map((line, index) => {
            const isVariable = line.trim().match(/{{.*?}}/g);
            const parts = isVariable ? 
              line.split(/({{.*?}})/g) : 
              [line];

            return (
              <div 
                key={index} 
                className={cn(
                  "mb-4 transition-colors",
                  line.trim().length === 0 && "h-4"
                )}
              >
                {parts.map((part, partIndex) => (
                  <span
                    key={partIndex}
                    className={cn(
                      part.startsWith('{{') && part.endsWith('}}') && 
                      "text-primary font-semibold bg-primary/5 px-1 rounded"
                    )}
                  >
                    {part}
                  </span>
                ))}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};
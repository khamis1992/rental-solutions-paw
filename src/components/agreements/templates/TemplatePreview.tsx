import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface TemplatePreviewProps {
  content: string;
  missingVariables?: string[];
}

export const TemplatePreview = ({ content, missingVariables = [] }: TemplatePreviewProps) => {
  const [textAlignment, setTextAlignment] = useState<'left' | 'center' | 'right'>('left');
  
  // Check if content contains Arabic text
  const containsArabic = (text: string) => {
    const arabicPattern = /[\u0600-\u06FF]/;
    return arabicPattern.test(text);
  };

  const isArabic = containsArabic(content);

  // Default to right alignment for Arabic text
  useState(() => {
    if (isArabic) {
      setTextAlignment('right');
    }
  });

  return (
    <div className="space-y-6">
      <DialogHeader>
        <div className="flex justify-between items-center">
          <DialogTitle className="text-xl font-semibold">
            {isArabic ? "معاينة النموذج" : "Template Preview"}
          </DialogTitle>
          <div className="flex gap-2">
            <Button
              variant={textAlignment === 'left' ? "default" : "outline"}
              size="sm"
              onClick={() => setTextAlignment('left')}
              className="w-9 h-9 p-0"
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button
              variant={textAlignment === 'center' ? "default" : "outline"}
              size="sm"
              onClick={() => setTextAlignment('center')}
              className="w-9 h-9 p-0"
            >
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button
              variant={textAlignment === 'right' ? "default" : "outline"}
              size="sm"
              onClick={() => setTextAlignment('right')}
              className="w-9 h-9 p-0"
            >
              <AlignRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
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
            isArabic ? "font-arabic" : "",
            "text-base leading-relaxed",
            {
              'text-left': textAlignment === 'left',
              'text-center': textAlignment === 'center',
              'text-right': textAlignment === 'right'
            }
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
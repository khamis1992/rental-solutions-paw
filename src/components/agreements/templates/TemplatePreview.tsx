import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface TextStyle {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  fontSize: number;
  alignment: 'left' | 'center' | 'right' | 'justify';
}

interface TemplatePreviewProps {
  content: string;
  missingVariables?: string[];
  textStyle?: TextStyle;
}

export const TemplatePreview = ({ 
  content, 
  missingVariables = [],
  textStyle = {
    bold: false,
    italic: false,
    underline: false,
    fontSize: 14,
    alignment: 'left'
  }
}: TemplatePreviewProps) => {
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
      
      <ScrollArea className="h-[600px] w-full rounded-md border bg-white shadow-sm">
        <div 
          className={cn(
            "p-12 mx-auto max-w-[800px]",
            isArabic ? "font-arabic" : "font-serif",
            "leading-relaxed",
            {
              'font-bold': textStyle.bold,
              'italic': textStyle.italic,
              'underline': textStyle.underline,
              'text-left': textStyle.alignment === 'left',
              'text-center': textStyle.alignment === 'center',
              'text-right': textStyle.alignment === 'right',
              'text-justify': textStyle.alignment === 'justify'
            }
          )}
          style={{
            direction: isArabic ? 'rtl' : 'ltr',
            fontSize: `${textStyle.fontSize}px`
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
                  "mb-6",
                  line.trim().length === 0 && "h-6"
                )}
              >
                {parts.map((part, partIndex) => (
                  <span
                    key={partIndex}
                    className={cn(
                      part.startsWith('{{') && part.endsWith('}}') && 
                      "text-primary font-semibold bg-primary/5 px-1.5 py-0.5 rounded"
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
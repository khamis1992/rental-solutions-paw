import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { TextStyle, Table } from "@/types/agreement.types";
import { useState } from "react";

interface TemplatePreviewProps {
  content: string;
  missingVariables?: string[];
  textStyle?: TextStyle;
  tables?: Table[];
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
  },
  tables = []
}: TemplatePreviewProps) => {
  const [pageCount, setPageCount] = useState(1);

  const containsArabic = (text: string) => {
    const arabicPattern = /[\u0600-\u06FF]/;
    return arabicPattern.test(text);
  };

  const processContent = (text: string) => {
    const isArabic = containsArabic(text);
    const dirAttribute = isArabic ? 'rtl' : 'ltr';

    let processedContent = text;
    
    // Center all bold text
    processedContent = processedContent.replace(
      /<strong>(.*?)<\/strong>/g,
      '<strong class="block text-center">$1</strong>'
    );

    // Process template variables
    processedContent = processedContent.replace(
      /{{(.*?)}}/g,
      '<span class="template-variable">{{$1}}</span>'
    );

    // Process section headers
    processedContent = processedContent.replace(
      /<h1>(.*?)<\/h1>/g,
      '<h1 class="text-2xl font-bold text-gray-900 mb-4">$1</h1>'
    );
    
    processedContent = processedContent.replace(
      /<h2>/g,
      '<h2 class="text-xl font-semibold mb-3 text-gray-800">'
    );

    // Optimize paragraph spacing
    processedContent = processedContent.replace(
      /<p>/g,
      `<p dir="${dirAttribute}" class="mb-3 leading-relaxed" style="text-align: ${isArabic ? 'right' : 'left'}">`
    );

    // Optimize list spacing
    processedContent = processedContent.replace(
      /<ul>/g,
      '<ul class="list-disc list-inside mb-3 space-y-1">'
    );

    processedContent = processedContent.replace(
      /<ol>/g,
      '<ol class="list-decimal list-inside mb-3 space-y-1">'
    );

    return processedContent;
  };

  const isArabic = containsArabic(content);

  // Calculate page count based on content height
  const calculatePageCount = (containerRef: HTMLDivElement | null) => {
    if (containerRef) {
      const contentHeight = containerRef.scrollHeight;
      const pageHeight = 297; // A4 height in mm
      const calculatedPages = Math.ceil(contentHeight / pageHeight);
      setPageCount(calculatedPages);
    }
  };

  return (
    <div className="space-y-4 max-h-[80vh]">
      <DialogHeader>
        <div className="flex justify-between items-center">
          <DialogTitle className="text-xl font-semibold">
            {containsArabic(content) ? "معاينة النموذج" : "Template Preview"}
          </DialogTitle>
        </div>
      </DialogHeader>
      
      {missingVariables.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {containsArabic(content) ? 
              "المتغيرات التالية مفقودة: " + missingVariables.join("، ") :
              "The following variables are missing: " + missingVariables.join(", ")
            }
          </AlertDescription>
        </Alert>
      )}
      
      <ScrollArea className="h-[calc(80vh-120px)] w-full rounded-md border">
        <div className="preview-container mx-auto bg-white">
          <div 
            className={cn(
              "a4-page",
              isArabic ? "font-arabic" : "font-serif",
              "leading-relaxed text-gray-700",
              {
                'font-bold': textStyle.bold,
                'italic': textStyle.italic,
                'underline': textStyle.underline,
                'text-left': !isArabic && textStyle.alignment === 'left',
                'text-center': textStyle.alignment === 'center',
                'text-right': isArabic || textStyle.alignment === 'right',
                'text-justify': textStyle.alignment === 'justify'
              }
            )}
            style={{
              direction: isArabic ? 'rtl' : 'ltr',
              fontSize: `${textStyle.fontSize}px`,
              width: '210mm',
              minHeight: '297mm',
              padding: '20mm',
              margin: '0 auto',
              boxSizing: 'border-box',
              backgroundColor: 'white',
              boxShadow: '0 0 10px rgba(0,0,0,0.1)',
              position: 'relative'
            }}
            ref={calculatePageCount}
            dangerouslySetInnerHTML={{ __html: processContent(content) }}
          />
        </div>
      </ScrollArea>
    </div>
  );
};
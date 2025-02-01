import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Printer } from "lucide-react";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { TextStyle, Table } from "@/types/agreement.types";
import { useState } from "react";
import { Button } from "@/components/ui/button";

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

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const isRTL = containsArabic(content);
    const printContent = `
      <!DOCTYPE html>
      <html dir="${isRTL ? 'rtl' : 'ltr'}">
        <head>
          <title>Print Agreement Template</title>
          <meta charset="UTF-8">
          <style>
            @page {
              size: A4;
              margin: 20mm;
              bleed: 3mm;
              marks: crop cross;
            }
            
            body {
              margin: 0;
              padding: 0;
              width: 210mm;
              min-height: 297mm;
              font-family: ${isRTL ? '"Noto Sans Arabic", Arial' : 'Arial'}, sans-serif;
              line-height: 1.5;
              direction: ${isRTL ? 'rtl' : 'ltr'};
              font-size: ${textStyle.fontSize}px;
              ${textStyle.bold ? 'font-weight: bold;' : ''}
              ${textStyle.italic ? 'font-style: italic;' : ''}
              ${textStyle.underline ? 'text-decoration: underline;' : ''}
              text-align: ${textStyle.alignment};
              background: white;
            }

            .page-content {
              box-sizing: border-box;
              width: 210mm;
              min-height: 297mm;
              padding: 20mm;
              margin: 0 auto;
              background: white;
              position: relative;
            }

            .template-variable {
              background-color: #f3e8ff;
              color: #6b21a8;
              padding: 2px 6px;
              border-radius: 4px;
              border: 1px solid #e9d5ff;
              font-family: monospace;
              font-size: 0.875em;
            }

            table {
              width: 100% !important;
              border-collapse: collapse !important;
              page-break-inside: avoid;
              margin: 1em 0;
            }

            td, th {
              border: 1px solid #ddd !important;
              padding: 8px !important;
              text-align: ${isRTL ? 'right' : 'left'} !important;
            }

            img {
              max-width: 100%;
              height: auto;
              page-break-inside: avoid;
            }

            h1, h2, h3 { page-break-after: avoid; }
            
            ul, ol { page-break-inside: avoid; }

            .page-number {
              position: fixed;
              bottom: 10mm;
              width: 100%;
              text-align: center;
              font-size: 12px;
              color: #666;
            }

            @media print {
              html, body {
                width: 210mm;
                height: 297mm;
              }
              .page-content {
                margin: 0;
                border: initial;
                border-radius: initial;
                width: initial;
                min-height: initial;
                box-shadow: initial;
                background: initial;
                page-break-after: always;
              }
            }
          </style>
        </head>
        <body>
          <div class="page-content">
            ${processContent(content)}
            <div class="page-number">Page 1 of ${pageCount}</div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
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
  const processedContent = processContent(content);

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
          <Button 
            onClick={handlePrint}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            {containsArabic(content) ? "طباعة" : "Print"}
          </Button>
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
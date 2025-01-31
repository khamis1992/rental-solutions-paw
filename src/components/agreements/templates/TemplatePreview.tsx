import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ChevronDown, ChevronUp, Eye, EyeOff, List, Maximize, Minimize } from "lucide-react";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { TextStyle, Table, TemplateLayout } from "@/types/agreement.types";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { VariablePalette } from "./variables/VariablePalette";
import { defaultVariableGroups } from "./variables/variableGroups";
import { StyleControls } from "./styling/StyleControls";

interface TemplatePreviewProps {
  content: string;
  missingVariables?: string[];
  textStyle?: TextStyle;
  tables?: Table[];
  layout?: TemplateLayout;
  onContentChange?: (content: string) => void;
  onStyleChange?: (style: TextStyle) => void;
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
  tables = [],
  layout,
  onContentChange,
  onStyleChange
}: TemplatePreviewProps) => {
  const [collapsedSections, setCollapsedSections] = useState<string[]>([]);
  const [showVariables, setShowVariables] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showToc, setShowToc] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);
  const [tableOfContents, setTableOfContents] = useState<Array<{id: string, title: string, level: number}>>([]);
  const editorRef = useRef<HTMLDivElement>(null);

  const handleVariableSelect = (variable: string) => {
    if (!editorRef.current || !onContentChange) return;

    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const variableText = `{{${variable}}}`;
    
    // Get the current content
    const currentContent = editorRef.current.innerHTML;
    
    // Insert the variable at the cursor position
    const beforeRange = currentContent.substring(0, range.startOffset);
    const afterRange = currentContent.substring(range.endOffset);
    const newContent = beforeRange + variableText + afterRange;
    
    // Update the content
    onContentChange(newContent);
  };

  const containsArabic = (text: string) => {
    const arabicPattern = /[\u0600-\u06FF]/;
    return arabicPattern.test(text);
  };

  useEffect(() => {
    // Extract headings for table of contents
    if (contentRef.current) {
      const headings = contentRef.current.querySelectorAll('h1, h2, h3');
      const toc = Array.from(headings).map(heading => ({
        id: heading.id || heading.textContent?.replace(/\s+/g, '-').toLowerCase() || '',
        title: heading.textContent || '',
        level: parseInt(heading.tagName[1])
      }));
      setTableOfContents(toc);
    }
  }, [content]);

  const toggleSection = (sectionId: string) => {
    setCollapsedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const processContent = (text: string) => {
    const isArabic = containsArabic(text);
    const dirAttribute = isArabic ? 'rtl' : 'ltr';

    let processedContent = text;
    
    if (showVariables) {
      processedContent = processedContent.replace(
        /{{(.*?)}}/g,
        '<span class="template-variable bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded border border-purple-200 font-mono text-sm" style="direction: ltr; unicode-bidi: embed;">{{$1}}</span>'
      );
    }

    // Add section styling with collapsible functionality and IDs for navigation
    processedContent = processedContent.replace(
      /<h1>(.*?)<\/h1>/g,
      (match, content) => {
        const sectionId = content.replace(/\s+/g, '-').toLowerCase();
        return `
          <div class="section-header">
            <h1 id="${sectionId}" class="text-2xl font-bold mb-6 mt-8 text-gray-900 border-b pb-2 flex items-center justify-between cursor-pointer group" onclick="toggleSection('${sectionId}')">
              ${content}
              <span class="section-toggle opacity-0 group-hover:opacity-100 transition-opacity">
                ${collapsedSections.includes(sectionId) ? '▼' : '▲'}
              </span>
            </h1>
            <div class="section-content ${collapsedSections.includes(sectionId) ? 'hidden' : ''}">
        `;
      }
    );
    
    processedContent = processedContent.replace(
      /<\/h1>/g,
      '</h1></div></div>'
    );
    
    processedContent = processedContent.replace(
      /<h2>/g,
      '<h2 class="text-xl font-semibold mb-4 mt-6 text-gray-800">'
    );

    // Style paragraphs with proper spacing and line height
    processedContent = processedContent.replace(
      /<p>/g,
      `<p dir="${dirAttribute}" class="mb-4 leading-relaxed" style="text-align: ${isArabic ? 'right' : 'left'}">`
    );

    // Style lists
    processedContent = processedContent.replace(
      /<ul>/g,
      '<ul class="list-disc list-inside mb-4 space-y-2">'
    );

    processedContent = processedContent.replace(
      /<ol>/g,
      '<ol class="list-decimal list-inside mb-4 space-y-2">'
    );

    return processedContent;
  };

  const isArabic = containsArabic(content);
  const processedContent = processContent(content);

  const renderLayout = () => {
    return (
      <>
        {layout?.watermark?.enabled && (
          <div 
            className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
            style={{ opacity: layout.watermark.opacity }}
          >
            <div className="transform -rotate-45 text-gray-200 text-6xl font-bold">
              {layout.watermark.text}
            </div>
          </div>
        )}
        
        {layout?.letterhead?.enabled && (
          <div 
            className="w-full bg-gray-50 border-b"
            style={{ height: `${layout.letterhead.height}px` }}
          >
            {layout.letterhead.content}
          </div>
        )}

        {layout?.logo?.enabled && layout.logo.url && (
          <div className={cn(
            "py-4",
            {
              "text-left": layout.logo.position === "left",
              "text-center": layout.logo.position === "center",
              "text-right": layout.logo.position === "right"
            }
          )}>
            <img 
              src={layout.logo.url} 
              alt="Company Logo"
              style={{ 
                height: `${layout.logo.size}px`,
                display: 'inline-block'
              }}
            />
          </div>
        )}

        {/* Main content */}
        <div 
          ref={editorRef}
          className={cn(
            "p-12 mx-auto max-w-[800px]",
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
            fontSize: `${textStyle.fontSize}px`
          }}
          dangerouslySetInnerHTML={{ __html: processedContent }}
          contentEditable={!!onContentChange}
          onInput={(e) => onContentChange?.(e.currentTarget.innerHTML)}
        />

        {/* Page numbering */}
        {layout?.pageNumbering?.enabled && (
          <div className={cn(
            "w-full text-center text-gray-500 text-sm py-4",
            {
              "mt-auto": layout.pageNumbering.position === "bottom",
              "mb-auto": layout.pageNumbering.position === "top"
            }
          )}>
            Page 1
          </div>
        )}
      </>
    );
  };

  return (
    <div className={cn(
      "space-y-6 flex gap-4",
      isFullscreen && "fixed inset-0 bg-white z-50 p-6"
    )}>
      {/* Variable Palette */}
      <div className={cn(
        "transition-all duration-200",
        isFullscreen ? "block" : "hidden md:block"
      )}>
        <VariablePalette
          onVariableSelect={handleVariableSelect}
          currentContent={content}
          availableVariables={defaultVariableGroups}
        />
      </div>

      <div className="flex-1">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              {isArabic ? "معاينة النموذج" : "Template Preview"}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowToc(!showToc)}
                className="flex items-center gap-2"
              >
                <List className="h-4 w-4" />
                {showToc ? "Hide TOC" : "Show TOC"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowVariables(!showVariables)}
                className="flex items-center gap-2"
              >
                {showVariables ? (
                  <>
                    <EyeOff className="h-4 w-4" />
                    Hide Variables
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4" />
                    Show Variables
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="flex items-center gap-2"
              >
                {isFullscreen ? (
                  <>
                    <Minimize className="h-4 w-4" />
                    Exit Fullscreen
                  </>
                ) : (
                  <>
                    <Maximize className="h-4 w-4" />
                    Fullscreen
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogHeader>

        {onStyleChange && (
          <StyleControls
            style={textStyle}
            onStyleChange={onStyleChange}
          />
        )}

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

        <div className="flex gap-6 mt-4">
          {showToc && (
            <div className="w-64 shrink-0">
              <div className="sticky top-0 max-h-[calc(100vh-2rem)] overflow-auto p-4 rounded-lg border bg-gray-50">
                <h3 className="font-semibold mb-2">Table of Contents</h3>
                <nav>
                  {tableOfContents.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      className={cn(
                        "block w-full text-left py-1 px-2 rounded hover:bg-gray-100 transition-colors",
                        "text-sm",
                        item.level === 1 ? "font-medium" : "pl-4 text-gray-600"
                      )}
                    >
                      {item.title}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          )}

          <ScrollArea className={cn(
            "rounded-md border bg-white shadow-sm",
            isFullscreen ? "h-[calc(100vh-8rem)]" : "h-[600px]",
            "flex-1 relative"
          )}>
            {renderLayout()}
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

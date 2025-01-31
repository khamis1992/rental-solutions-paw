import { cn } from "@/lib/utils";

interface TemplatePreviewProps {
  content: string;
  missingVariables: string[];
  className?: string;
  dir?: 'ltr' | 'rtl';
}

export const TemplatePreview = ({ 
  content, 
  missingVariables,
  className,
  dir = 'ltr' 
}: TemplatePreviewProps) => {
  return (
    <div 
      className={cn(
        "bg-white p-8 rounded-lg shadow min-h-[29.7cm] w-[21cm] mx-auto",
        "prose prose-sm max-w-none",
        className
      )}
      dir={dir}
    >
      <div 
        dangerouslySetInnerHTML={{ __html: content }} 
        className="template-content"
      />
      
      {missingVariables.length > 0 && (
        <div className="mt-8 p-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-red-500">Missing Variables:</h4>
          <ul className="mt-2 text-sm text-gray-500">
            {missingVariables.map((variable) => (
              <li key={variable}>{variable}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
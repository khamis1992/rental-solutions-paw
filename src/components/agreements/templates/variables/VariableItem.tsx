import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Check, Variable } from "lucide-react";
import { cn } from "@/lib/utils";

interface VariableItemProps {
  variable: {
    key: string;
    description: string;
    example?: string;
  };
  isUsed: boolean;
  onClick: () => void;
}

export const VariableItem = ({ variable, isUsed, onClick }: VariableItemProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            className={cn(
              "w-full px-3 py-2 text-left flex items-center gap-2 rounded-md",
              "hover:bg-accent hover:text-accent-foreground transition-colors",
              "relative group",
              isUsed && "text-primary"
            )}
          >
            <Variable className="h-4 w-4 shrink-0" />
            <span className="font-mono text-sm truncate">
              {`{{${variable.key}}}`}
            </span>
            {isUsed && (
              <Check className="h-4 w-4 text-primary absolute right-2" />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-medium">{variable.description}</p>
            {variable.example && (
              <p className="text-sm text-muted-foreground">
                Example: {variable.example}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
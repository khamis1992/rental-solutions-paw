import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Variable, Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface VariableGroup {
  name: string;
  variables: {
    key: string;
    description: string;
    example?: string;
  }[];
}

interface VariablePaletteProps {
  onVariableSelect: (variable: string) => void;
  currentContent?: string;
  availableVariables: VariableGroup[];
}

export const VariablePalette = ({
  onVariableSelect,
  currentContent = "",
  availableVariables,
}: VariablePaletteProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredVariables, setFilteredVariables] = useState(availableVariables);
  const [hoveredVariable, setHoveredVariable] = useState<string | null>(null);

  // Check if a variable is used in the content
  const isVariableUsed = (variable: string) => {
    return currentContent.includes(`{{${variable}}}`);
  };

  // Filter variables based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredVariables(availableVariables);
      return;
    }

    const filtered = availableVariables.map(group => ({
      ...group,
      variables: group.variables.filter(v => 
        v.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })).filter(group => group.variables.length > 0);

    setFilteredVariables(filtered);
  }, [searchTerm, availableVariables]);

  return (
    <div className="w-64 bg-white border rounded-lg shadow-lg">
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search variables..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <ScrollArea className="h-[400px]">
        <div className="p-2">
          {filteredVariables.map((group) => (
            <div key={group.name} className="mb-4">
              <h3 className="text-sm font-semibold text-muted-foreground mb-2 px-2">
                {group.name}
              </h3>
              <div className="space-y-1">
                {group.variables.map((variable) => {
                  const isUsed = isVariableUsed(variable.key);
                  return (
                    <Button
                      key={variable.key}
                      variant="ghost"
                      className={cn(
                        "w-full justify-start text-left relative group",
                        isUsed && "text-green-600"
                      )}
                      onMouseEnter={() => setHoveredVariable(variable.key)}
                      onMouseLeave={() => setHoveredVariable(null)}
                      onClick={() => onVariableSelect(variable.key)}
                    >
                      <Variable className="h-4 w-4 mr-2 shrink-0" />
                      <div className="truncate">
                        <span className="font-mono text-sm">
                          {`{{${variable.key}}}`}
                        </span>
                      </div>
                      {isUsed && (
                        <Check className="h-4 w-4 text-green-600 absolute right-2" />
                      )}
                      {hoveredVariable === variable.key && (
                        <div className="absolute z-50 left-full ml-2 p-2 bg-white border rounded-md shadow-lg w-48">
                          <p className="text-sm font-medium">{variable.description}</p>
                          {variable.example && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Example: {variable.example}
                            </p>
                          )}
                        </div>
                      )}
                    </Button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-3 border-t bg-muted/50">
        <div className="flex items-center text-xs text-muted-foreground">
          <AlertCircle className="h-3 w-3 mr-1" />
          <span>Click a variable to insert</span>
        </div>
      </div>
    </div>
  );
};
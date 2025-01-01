import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface ImportErrorAnalysisProps {
  errors: any[];
  onSuggestionClick?: (suggestion: string) => void;
}

export const ImportErrorAnalysis = ({ errors, onSuggestionClick }: ImportErrorAnalysisProps) => {
  const handleSuggestionClick = (suggestion: string) => {
    // Copy suggestion to clipboard
    navigator.clipboard.writeText(suggestion);
    toast.success("Suggestion copied to clipboard");
    
    if (onSuggestionClick) {
      onSuggestionClick(suggestion);
    }
  };

  if (!errors || errors.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold mb-2">Errors Found:</h4>
          <ul className="list-disc pl-5 space-y-1">
            {errors.map((error, index) => (
              <li key={index} className="text-sm text-muted-foreground">
                {error.error || error.message}
                {error.payment && (
                  <span className="block text-xs mt-1">
                    Row data: {JSON.stringify(error.payment)}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-2">AI Suggestions:</h4>
          <div className="space-y-2">
            {errors.map((error, index) => {
              const suggestion = `Fix payment import error: ${error.error || error.message}`;
              return (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full text-left justify-start"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </Button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
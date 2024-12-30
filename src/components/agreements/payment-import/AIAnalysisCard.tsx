import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface AIAnalysisCardProps {
  analysisResult: {
    summary: string;
    warnings?: string[];
    suggestions?: string[];
  };
  onImplementChanges: () => void;
  isUploading: boolean;
}

export const AIAnalysisCard = ({ 
  analysisResult, 
  onImplementChanges, 
  isUploading 
}: AIAnalysisCardProps) => {
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>AI Analysis Results</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h4 className="font-medium">Summary:</h4>
          <p>{analysisResult.summary}</p>
        </div>
        
        {analysisResult.warnings?.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-yellow-600">Warnings:</h4>
            <ul className="list-disc pl-4 space-y-1">
              {analysisResult.warnings.map((warning: string, index: number) => (
                <li key={index} className="text-sm">{warning}</li>
              ))}
            </ul>
          </div>
        )}
        
        {analysisResult.suggestions?.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-blue-600">Suggestions:</h4>
            <ul className="list-disc pl-4 space-y-1">
              {analysisResult.suggestions.map((suggestion: string, index: number) => (
                <li key={index} className="text-sm">{suggestion}</li>
              ))}
            </ul>
          </div>
        )}

        <Button
          onClick={onImplementChanges}
          disabled={isUploading}
          className="w-full mt-4"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Implementing Changes...
            </>
          ) : (
            'Implement Changes'
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Copy, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface ImportErrorAnalysisProps {
  errors: any[];
  onSuggestionClick?: (suggestion: string) => void;
}

export const ImportErrorAnalysis = ({ errors, onSuggestionClick }: ImportErrorAnalysisProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<{
    analysis: string;
    suggestions: string[];
  } | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const analyzeErrors = async () => {
    setIsAnalyzing(true);
    try {
      const response = await supabase.functions.invoke('analyze-import-errors', {
        body: { errors }
      });

      if (response.error) throw response.error;
      setAnalysis(response.data);
      toast.success('Analysis complete');
    } catch (error) {
      console.error('Error analyzing errors:', error);
      toast.error('Failed to analyze errors');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopy = (suggestion: string, index: number) => {
    navigator.clipboard.writeText(suggestion);
    setCopiedIndex(index);
    toast.success('Suggestion copied to clipboard');
    setTimeout(() => setCopiedIndex(null), 2000);
    
    if (onSuggestionClick) {
      onSuggestionClick(suggestion);
    }
  };

  if (!errors?.length) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Import Error Analysis</span>
          {!analysis && (
            <Button 
              onClick={analyzeErrors} 
              disabled={isAnalyzing}
              variant="outline"
              size="sm"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Analyze with AI'
              )}
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {analysis ? (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground whitespace-pre-wrap">
              {analysis.analysis}
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Suggested Actions:</h4>
              {analysis.suggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-between text-left"
                  onClick={() => handleCopy(suggestion, index)}
                >
                  <span className="mr-2">{suggestion}</span>
                  {copiedIndex === index ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            Click "Analyze with AI" to get suggestions for fixing the import errors.
          </div>
        )}
      </CardContent>
    </Card>
  );
};
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, MessageSquare } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ImportErrorAnalysisProps {
  errors: any[];
  onSuggestionClick: (suggestion: string) => void;
}

export const ImportErrorAnalysis = ({ errors, onSuggestionClick }: ImportErrorAnalysisProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  const analyzeErrors = async () => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-import-errors', {
        body: { errors }
      });

      if (error) throw error;
      
      const parsedAnalysis = JSON.parse(data.analysis);
      setAnalysis(parsedAnalysis);
    } catch (error) {
      console.error('Error analyzing errors:', error);
      toast.error('Failed to analyze errors');
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!errors.length) return null;

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          AI Error Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!analysis ? (
          <Button
            onClick={analyzeErrors}
            disabled={isAnalyzing}
            variant="outline"
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Errors...
              </>
            ) : (
              'Analyze Errors with AI'
            )}
          </Button>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {analysis.explanation}
            </p>
            
            <div className="space-y-2">
              <h4 className="font-semibold">Steps to Fix:</h4>
              <ul className="list-disc pl-5 space-y-1">
                {analysis.steps.map((step: string, index: number) => (
                  <li 
                    key={index}
                    className="text-sm text-muted-foreground cursor-pointer hover:text-primary"
                    onClick={() => onSuggestionClick(step)}
                  >
                    {step}
                  </li>
                ))}
              </ul>
            </div>

            {analysis.example && (
              <div className="space-y-2">
                <h4 className="font-semibold">Example:</h4>
                <pre className="text-sm bg-muted p-2 rounded-md overflow-x-auto">
                  {analysis.example}
                </pre>
              </div>
            )}

            <Button
              onClick={analyzeErrors}
              variant="outline"
              size="sm"
              className="w-full mt-4"
            >
              Analyze Again
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
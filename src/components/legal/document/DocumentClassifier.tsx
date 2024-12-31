import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DocumentClassifierProps {
  documentId: string;
  documentContent: string;
  documentType: string;
  onClassificationComplete?: (classification: any) => void;
}

export function DocumentClassifier({
  documentId,
  documentContent,
  documentType,
  onClassificationComplete
}: DocumentClassifierProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeDocument = async () => {
    try {
      setIsAnalyzing(true);
      console.log('Starting document analysis for:', documentId);

      const { data: existingClassification } = await supabase
        .from('ai_document_classification')
        .select('*')
        .eq('document_id', documentId)
        .maybeSingle();

      if (existingClassification) {
        console.log('Found existing classification:', existingClassification);
        onClassificationComplete?.(existingClassification);
        return;
      }

      const { data, error } = await supabase.functions
        .invoke('analyze-legal-document', {
          body: {
            documentId,
            documentContent,
            documentType: documentType || 'unspecified'
          }
        });

      if (error) throw error;

      console.log('Analysis complete:', data);
      toast.success('Document analyzed successfully');
      onClassificationComplete?.(data.classification);

    } catch (error: any) {
      console.error('Error analyzing document:', error);
      toast.error(error.message || 'Failed to analyze document');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Document Classification
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button
            onClick={analyzeDocument}
            disabled={isAnalyzing}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Analyze Document'
            )}
          </Button>

          {isAnalyzing && (
            <div className="text-sm text-muted-foreground text-center">
              This may take a few moments...
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DocumentClassificationProps {
  documentId: string;
}

export function DocumentClassification({ documentId }: DocumentClassificationProps) {
  const { data: classification, isLoading } = useQuery({
    queryKey: ['document-classification', documentId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('ai_document_classification')
          .select('*')
          .eq('document_id', documentId)
          .maybeSingle();

        if (error) {
          console.error('Error fetching document classification:', error);
          toast.error('Failed to fetch document classification');
          throw error;
        }

        return data;
      } catch (err) {
        console.error('Error in classification query:', err);
        return null;
      }
    }
  });

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document Classification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!classification) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2 text-muted-foreground">
            <AlertCircle className="h-5 w-5" />
            Not Analyzed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This document hasn't been analyzed yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  const confidenceColor = 
    classification.confidence_score >= 0.8 ? 'bg-green-500' :
    classification.confidence_score >= 0.6 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
          Document Classification
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">Document Type</p>
            <Badge variant="outline" className="capitalize">
              {classification.classification_type.replace('_', ' ')}
            </Badge>
          </div>
          <div className="text-right space-y-1">
            <p className="text-sm font-medium">Confidence Score</p>
            <Badge className={confidenceColor}>
              {Math.round(classification.confidence_score * 100)}%
            </Badge>
          </div>
        </div>

        {classification.metadata && (
          <div className="space-y-2 pt-2 border-t">
            <p className="text-sm font-medium">Key Features</p>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(classification.metadata).map(([key, value]) => (
                <div key={key} className="text-sm">
                  <span className="font-medium capitalize">
                    {key.replace('_', ' ')}:
                  </span>{' '}
                  {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value.toString()}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
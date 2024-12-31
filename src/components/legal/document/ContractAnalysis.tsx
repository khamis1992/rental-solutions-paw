import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, CheckCircle, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface ContractAnalysisProps {
  documentId: string;
}

export function ContractAnalysis({ documentId }: ContractAnalysisProps) {
  const { data: analysis, isLoading } = useQuery({
    queryKey: ["contract-analysis", documentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_document_classification")
        .select("*")
        .eq("document_id", documentId)
        .eq("classification_type", "contract_analysis")
        .single();

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Clock className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-muted-foreground">
        <AlertCircle className="h-8 w-8 mb-2" />
        <p>No analysis available</p>
      </div>
    );
  }

  const { metadata, confidence_score } = analysis;

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Contract Analysis</h3>
          <Badge variant={confidence_score > 0.8 ? "success" : "warning"}>
            {Math.round(confidence_score * 100)}% Confidence
          </Badge>
        </div>

        <Card className="p-4 space-y-2">
          <h4 className="font-medium">Key Terms</h4>
          <ul className="list-disc pl-4 space-y-1">
            {metadata.key_terms.map((term: string, index: number) => (
              <li key={index} className="text-sm">{term}</li>
            ))}
          </ul>
        </Card>

        <Card className="p-4 space-y-2">
          <h4 className="font-medium">Obligations</h4>
          <ul className="list-disc pl-4 space-y-1">
            {metadata.obligations.map((obligation: string, index: number) => (
              <li key={index} className="text-sm">{obligation}</li>
            ))}
          </ul>
        </Card>

        <Card className="p-4 space-y-2">
          <h4 className="font-medium">Risks & Liabilities</h4>
          <ul className="list-disc pl-4 space-y-1">
            {metadata.risks.map((risk: string, index: number) => (
              <li key={index} className="text-sm text-destructive">{risk}</li>
            ))}
          </ul>
        </Card>

        <Card className="p-4 space-y-2">
          <h4 className="font-medium">Recommendations</h4>
          <ul className="list-disc pl-4 space-y-1">
            {metadata.recommendations.map((rec: string, index: number) => (
              <li key={index} className="text-sm text-green-600 dark:text-green-400">
                {rec}
              </li>
            ))}
          </ul>
        </Card>

        <div className="text-xs text-muted-foreground">
          Last analyzed: {new Date(metadata.analyzed_at).toLocaleString()}
        </div>
      </div>
    </ScrollArea>
  );
}
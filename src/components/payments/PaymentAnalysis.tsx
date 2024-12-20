import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface PaymentAnalysisProps {
  paymentId: string;
}

interface PaymentAnalysis {
  id: string;
  payment_id: string;
  analysis_type: string;
  confidence_score: number;
  anomaly_detected: boolean;
  anomaly_details: string[];
  suggested_corrections: Record<string, string | number>;
  created_at: string;
  resolved_at: string | null;
  resolved_by: string | null;
  status: string;
}

export const PaymentAnalysis = ({ paymentId }: PaymentAnalysisProps) => {
  const { data: analysis, isLoading } = useQuery({
    queryKey: ["payment-analysis", paymentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_payment_analysis")
        .select("*")
        .eq("payment_id", paymentId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      return data as PaymentAnalysis;
    },
  });

  const runAnalysis = async () => {
    try {
      const response = await supabase.functions.invoke("analyze-payment", {
        body: { paymentId },
      });

      if (response.error) throw response.error;

      toast.success("Payment analysis completed");
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("Failed to analyze payment");
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return "text-green-500";
    if (score >= 0.6) return "text-yellow-500";
    return "text-red-500";
  };

  if (isLoading) {
    return <div>Loading analysis...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Payment Analysis
          <Button variant="outline" size="sm" onClick={runAnalysis}>
            Run Analysis
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {analysis ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {analysis.anomaly_detected ? (
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
                <span className="font-medium">
                  {analysis.anomaly_detected
                    ? "Anomalies Detected"
                    : "Payment Validated"}
                </span>
              </div>
              <div className={getConfidenceColor(analysis.confidence_score)}>
                {(analysis.confidence_score * 100).toFixed(0)}% confidence
              </div>
            </div>

            {analysis.anomaly_detected && analysis.anomaly_details && (
              <div className="space-y-2">
                <div className="font-medium">Detected Issues:</div>
                <div className="space-y-1">
                  {analysis.anomaly_details.map((anomaly: string, index: number) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                      {anomaly}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {analysis.suggested_corrections && Object.keys(analysis.suggested_corrections).length > 0 && (
              <div className="space-y-2">
                <div className="font-medium">Suggested Corrections:</div>
                <div className="space-y-1">
                  {Object.entries(analysis.suggested_corrections).map(
                    ([field, value], index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-muted-foreground">{field}:</span>
                        <Badge variant="secondary">{String(value)}</Badge>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-muted-foreground">
            No analysis available. Click "Run Analysis" to analyze this payment.
          </div>
        )}
      </CardContent>
    </Card>
  );
};
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, AlertTriangle, TrendingUp, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

export const AiAnalyticsInsights = () => {
  const [query, setQuery] = useState("");

  const { data: insights, refetch: refetchInsights } = useQuery({
    queryKey: ["analytics-insights"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_analytics_insights")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
  });

  const { data: anomalies } = useQuery({
    queryKey: ["operational-anomalies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("operational_anomalies")
        .select("*")
        .is("resolved_at", null)
        .order("detected_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
  });

  const handleAnalyze = async () => {
    try {
      const { error } = await supabase.functions.invoke("analyze-performance", {
        body: { includesDiskMetrics: true }
      });

      if (error) throw error;

      await refetchInsights();
      toast.success("Analysis completed successfully");
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("Failed to complete analysis");
    }
  };

  const handleNaturalLanguageQuery = async () => {
    if (!query.trim()) {
      toast.error("Please enter a query");
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke("analyze-performance", {
        body: { query: query.trim() }
      });

      if (error) throw error;

      toast.success("Query processed successfully");
      // Process and display results
    } catch (error) {
      console.error("Query error:", error);
      toast.error("Failed to process query");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Natural Language Query
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Ask questions about your data..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleNaturalLanguageQuery}>
              Ask AI
            </Button>
          </div>
          <Button 
            variant="outline" 
            onClick={handleAnalyze}
            className="w-full"
          >
            Run Full Analysis
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Performance Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights?.map((insight) => (
              <div
                key={insight.id}
                className="flex items-start justify-between p-4 border rounded-lg"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={insight.priority === 1 ? "destructive" : "secondary"}>
                      {insight.category}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {new Date(insight.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm">{insight.insight}</p>
                  {insight.confidence_score && (
                    <p className="text-xs text-muted-foreground">
                      Confidence: {(insight.confidence_score * 100).toFixed(1)}%
                    </p>
                  )}
                </div>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Detected Anomalies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {anomalies?.map((anomaly) => (
              <div
                key={anomaly.id}
                className="flex items-start justify-between p-4 border rounded-lg"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        anomaly.severity === "high"
                          ? "destructive"
                          : anomaly.severity === "medium"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {anomaly.detection_type}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {new Date(anomaly.detected_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm">{anomaly.description}</p>
                </div>
                <AlertTriangle className="h-4 w-4 text-destructive" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
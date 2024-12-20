import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, AlertTriangle, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const AiAnalyticsInsights = () => {
  const { data: insights } = useQuery({
    queryKey: ["analytics-insights"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("analytics_insights")
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
        .is("resolved_at", null) // Changed from eq.null to is null
        .order("detected_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
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
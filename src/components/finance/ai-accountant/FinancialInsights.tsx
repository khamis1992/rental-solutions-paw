import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";

interface FinancialInsight {
  id: string;
  category: string;
  insight: string;
  recommendation: string | null;
  priority: number;
  status: string;
  created_at: string;
  data_points: any;
  confidence_score: number;
  analyzed_at: string;
  action_taken: boolean;
}

export const FinancialInsights = () => {
  const { data: insights, isLoading } = useQuery({
    queryKey: ["financial-insights"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("financial_insights")
        .select("*")
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data as FinancialInsight[];
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Financial Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights?.map((insight) => (
            <div
              key={insight.id}
              className="flex items-start gap-4 p-4 bg-muted rounded-lg"
            >
              {insight.priority === 1 ? (
                <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />
              ) : insight.category === 'growth' ? (
                <TrendingUp className="h-5 w-5 text-emerald-500 flex-shrink-0" />
              ) : (
                <TrendingDown className="h-5 w-5 text-blue-500 flex-shrink-0" />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={insight.priority === 1 ? "destructive" : "secondary"}>
                    {insight.category}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {new Date(insight.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm">{insight.insight}</p>
                {insight.recommendation && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Recommendation: {insight.recommendation}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { LightbulbIcon, TrendingUpIcon, AlertTriangleIcon } from "lucide-react";

interface BusinessInsight {
  id: string;
  category: string;
  insight_type: string;
  title: string;
  description: string;
  metrics: Record<string, any> | null;
  importance_score: number;
  status: string;
  created_at: string;
}

const getInsightIcon = (type: string) => {
  switch (type) {
    case 'opportunity':
      return <TrendingUpIcon className="h-5 w-5 text-green-500" />;
    case 'warning':
      return <AlertTriangleIcon className="h-5 w-5 text-yellow-500" />;
    default:
      return <LightbulbIcon className="h-5 w-5 text-blue-500" />;
  }
};

const getImportanceColor = (score: number) => {
  if (score >= 8) return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
  if (score >= 5) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
  return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
};

export const AutomatedInsights = () => {
  const { data: insights, isLoading } = useQuery({
    queryKey: ["business-insights"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("business_insights")
        .select("*")
        .order("importance_score", { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data as BusinessInsight[];
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-[250px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Business Insights</h2>
      </div>
      <div className="space-y-4">
        {insights?.map((insight) => (
          <Card key={insight.id} className="relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-1 h-full ${
              insight.insight_type === 'opportunity' ? 'bg-green-500' :
              insight.insight_type === 'warning' ? 'bg-yellow-500' :
              'bg-blue-500'
            }`} />
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getInsightIcon(insight.insight_type)}
                  <CardTitle className="text-sm font-medium">
                    {insight.title}
                  </CardTitle>
                </div>
                <Badge 
                  variant="secondary"
                  className={getImportanceColor(insight.importance_score)}
                >
                  Priority {insight.importance_score}/10
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {insight.description}
              </p>
              {insight.metrics && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {Object.entries(insight.metrics).map(([key, value]) => (
                    <Badge key={key} variant="outline">
                      {key}: {value}
                    </Badge>
                  ))}
                </div>
              )}
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <span>{new Date(insight.created_at).toLocaleDateString()}</span>
                <Badge variant="outline" className="text-xs">
                  {insight.category}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
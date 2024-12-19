import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface AnalyticsDataPoints {
  quality_score: number;
  security_score: number;
  performance_score: number;
  total_issues: number;
  critical_issues: number;
  warnings: number;
  info: number;
  recommendations: string[];
}

interface AnalyticsInsight {
  id: string;
  category: string;
  insight: string;
  data_points: AnalyticsDataPoints;
  confidence_score: number;
  created_at: string;
  analyzed_at: string;
  status: string;
  priority: number;
  action_taken: boolean;
}

export function CodeAnalysisDashboard() {
  const { data: insights, isLoading } = useQuery({
    queryKey: ['analytics-insights'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('analytics_insights')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data as unknown as AnalyticsInsight[];
    }
  });

  if (isLoading) {
    return <div>Loading analytics...</div>;
  }

  const latestInsight = insights?.[0];
  const dataPoints = latestInsight?.data_points as AnalyticsDataPoints;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Code Analysis Dashboard</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <h3 className="font-semibold mb-2">Code Quality</h3>
          <Progress value={dataPoints?.quality_score ?? 0} className="mb-2" />
          <p className="text-sm text-muted-foreground">
            Score: {dataPoints?.quality_score ?? 0}%
          </p>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-2">Security Score</h3>
          <Progress value={dataPoints?.security_score ?? 0} className="mb-2" />
          <p className="text-sm text-muted-foreground">
            Score: {dataPoints?.security_score ?? 0}%
          </p>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-2">Performance</h3>
          <Progress value={dataPoints?.performance_score ?? 0} className="mb-2" />
          <p className="text-sm text-muted-foreground">
            Score: {dataPoints?.performance_score ?? 0}%
          </p>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-2">Issues</h3>
          <Progress value={dataPoints?.total_issues ? 100 - (dataPoints.total_issues / 100) : 0} className="mb-2" />
          <p className="text-sm text-muted-foreground">
            Total: {dataPoints?.total_issues ?? 0}
          </p>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Issue Breakdown</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm">Critical Issues</span>
                <span className="text-sm font-medium">{dataPoints?.critical_issues ?? 0}</span>
              </div>
              <Progress value={dataPoints?.critical_issues ? (dataPoints.critical_issues / dataPoints.total_issues) * 100 : 0} className="bg-red-100" />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm">Warnings</span>
                <span className="text-sm font-medium">{dataPoints?.warnings ?? 0}</span>
              </div>
              <Progress value={dataPoints?.warnings ? (dataPoints.warnings / dataPoints.total_issues) * 100 : 0} className="bg-yellow-100" />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm">Info</span>
                <span className="text-sm font-medium">{dataPoints?.info ?? 0}</span>
              </div>
              <Progress value={dataPoints?.info ? (dataPoints.info / dataPoints.total_issues) * 100 : 0} className="bg-blue-100" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-4">Recommendations</h3>
          <ul className="space-y-2">
            {dataPoints?.recommendations?.map((recommendation, index) => (
              <li key={index} className="text-sm">
                • {recommendation}
              </li>
            )) ?? <li className="text-sm text-muted-foreground">No recommendations available</li>}
          </ul>
        </Card>
      </div>

      <Card className="p-4">
        <h3 className="font-semibold mb-4">Latest Insights</h3>
        <div className="space-y-4">
          {insights?.map((insight) => (
            <div key={insight.id} className="border-b pb-4 last:border-0">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium">{insight.category}</h4>
                  <p className="text-sm text-muted-foreground">{insight.insight}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  insight.priority === 1 ? 'bg-red-100 text-red-800' :
                  insight.priority === 2 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  Priority {insight.priority}
                </span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Analyzed: {new Date(insight.analyzed_at).toLocaleDateString()}</span>
                <span>Confidence: {insight.confidence_score}%</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface CodeQualityMetricsProps {
  data: any[];
}

export const CodeQualityMetrics = ({ data }: CodeQualityMetricsProps) => {
  const metrics = data?.[0]?.data_points?.quality_metrics || [];

  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-muted-foreground">Score: {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Code Quality Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={metrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip content={customTooltip} />
              <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid gap-4">
          {metrics.map((metric: any, index: number) => (
            <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">{metric.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {getMetricDescription(metric.name)}
                </p>
              </div>
              <div className="text-xl font-bold">{metric.value}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const getMetricDescription = (metricName: string): string => {
  const descriptions: Record<string, string> = {
    "Code Coverage": "Percentage of code covered by tests",
    "Maintainability": "Measure of how easy the code is to maintain",
    "Documentation": "Quality and completeness of code documentation",
    "Complexity": "Cyclomatic complexity score",
    "Duplication": "Percentage of duplicated code",
    "Best Practices": "Adherence to coding best practices"
  };
  return descriptions[metricName] || "No description available";
};
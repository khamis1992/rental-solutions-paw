import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface CodeQualityMetricsProps {
  data: any[];
}

export const CodeQualityMetrics = ({ data }: CodeQualityMetricsProps) => {
  const metrics = data?.[0]?.data_points?.quality_metrics || [];

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Code Quality Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={metrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
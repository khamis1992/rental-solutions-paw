import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/utils";
import { AnalyticsInsight } from "@/types/finance.types";

export const ScenarioAnalysis = () => {
  const { data: insights } = useQuery({
    queryKey: ["analytics-insights"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("analytics_insights")
        .select("*")
        .eq("category", "scenario_analysis")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as AnalyticsInsight[];
    }
  });

  const chartData = insights?.map(insight => ({
    name: new Date(insight.created_at).toLocaleDateString(),
    roi: insight.data_points?.roi_percentage || 0,
    profit: insight.data_points?.net_profit || 0
  })) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scenario Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="roi"
                name="ROI %"
                stroke="#4ade80"
                strokeWidth={2}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="profit"
                name="Net Profit"
                stroke="#60a5fa"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TrendingDown, TrendingUp, AlertTriangle } from "lucide-react";

export const PredictiveAnalytics = () => {
  const { data: predictions } = useQuery({
    queryKey: ["revenue-forecasts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("revenue_forecasts")
        .select("*")
        .order("forecast_date", { ascending: true })
        .limit(12); // Get 12 months of predictions

      if (error) throw error;
      return data;
    },
  });

  const currentMonthRevenue = predictions?.[0]?.predicted_revenue || 0;
  const threeMonthsLaterRevenue = predictions?.[2]?.predicted_revenue || 0;
  const percentageChange = ((threeMonthsLaterRevenue - currentMonthRevenue) / currentMonthRevenue) * 100;
  const isDecline = percentageChange < 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Monthly Revenue Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          {isDecline && (
            <Alert className="mb-6" variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Revenue Alert</AlertTitle>
              <AlertDescription>
                Next quarter's revenue is projected to {isDecline ? "drop" : "increase"} by{" "}
                {Math.abs(percentageChange).toFixed(1)}% due to seasonal trends. Consider adjusting pricing or promotions.
              </AlertDescription>
            </Alert>
          )}

          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={predictions}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="forecast_date" 
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleString('default', { month: 'short', year: 'numeric' });
                  }}
                />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  labelFormatter={(label) => {
                    const date = new Date(label);
                    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="predicted_revenue"
                  stroke="#4ade80"
                  strokeWidth={2}
                  name="Predicted Revenue"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              {isDecline ? (
                <TrendingDown className="h-4 w-4 text-red-500" />
              ) : (
                <TrendingUp className="h-4 w-4 text-green-500" />
              )}
              <span>
                {isDecline ? "Decline" : "Growth"} Rate: {Math.abs(percentageChange).toFixed(1)}%
              </span>
            </div>
            <div>
              Next Quarter Forecast: {formatCurrency(threeMonthsLaterRevenue)}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
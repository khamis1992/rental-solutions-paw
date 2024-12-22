import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export const FinanceAIAssistant = () => {
  const { data: forecastData, isLoading: isLoadingForecast } = useQuery({
    queryKey: ["financial-forecasts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("financial_forecasts")
        .select("*")
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;
      return data[0]?.forecast_data || [];
    },
  });

  const { data: insights, isLoading: isLoadingInsights } = useQuery({
    queryKey: ["financial-insights"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("financial_insights")
        .select("*")
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data || [];
    },
  });

  if (isLoadingForecast || isLoadingInsights) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Financial Forecasting</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  labelFormatter={(label) => new Date(label).toLocaleDateString()}
                />
                <Line 
                  type="monotone" 
                  dataKey="predicted_revenue" 
                  stroke="#8884d8" 
                  name="Predicted Revenue"
                />
                <Line 
                  type="monotone" 
                  dataKey="predicted_expenses" 
                  stroke="#82ca9d" 
                  name="Predicted Expenses"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI Financial Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {insights?.map((insight) => (
            <Alert key={insight.id}>
              <AlertDescription>
                {insight.insight}
              </AlertDescription>
            </Alert>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
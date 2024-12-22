import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { ForecastData } from "@/types/finance.types";

export const FinanceAIAssistant = () => {
  const { data: forecastData, isLoading } = useQuery({
    queryKey: ["financial-forecasts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("financial_forecasts")
        .select("forecast_data")
        .eq("forecast_type", "monthly")
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) throw error;
      
      // Type assertion after validation
      const forecastArray = data?.[0]?.forecast_data as unknown as ForecastData[];
      if (!Array.isArray(forecastArray)) {
        throw new Error("Invalid forecast data format");
      }
      
      return forecastArray;
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
        <CardTitle>Financial Forecast</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={forecastData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                labelFormatter={(label) => label}
              />
              <Line
                type="monotone"
                dataKey="predicted_revenue"
                name="Predicted Revenue"
                stroke="#4ade80"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="predicted_expenses"
                name="Predicted Expenses"
                stroke="#f43f5e"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
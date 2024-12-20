import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface ForecastData {
  date: string;
  predicted_revenue: number;
  predicted_expenses: number;
}

type JsonValue = string | number | boolean | null | { [key: string]: JsonValue } | JsonValue[];

interface JsonForecastData {
  date: string;
  predicted_revenue: number | string;
  predicted_expenses: number | string;
  [key: string]: JsonValue;
}

const isJsonForecastData = (item: unknown): item is JsonForecastData => {
  if (typeof item !== 'object' || item === null) return false;
  const data = item as Record<string, unknown>;
  return (
    typeof data.date === 'string' &&
    (typeof data.predicted_revenue === 'number' || typeof data.predicted_revenue === 'string') &&
    (typeof data.predicted_expenses === 'number' || typeof data.predicted_expenses === 'string')
  );
};

export const FinancialForecasting = () => {
  const { data: forecasts, isLoading } = useQuery({
    queryKey: ["financial-forecasts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("financial_forecasts")
        .select("*")
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;
      
      const forecastData = data[0]?.forecast_data;
      if (!Array.isArray(forecastData)) {
        return [] as ForecastData[];
      }

      return forecastData
        .filter(isJsonForecastData)
        .map((item): ForecastData => ({
          date: String(item.date),
          predicted_revenue: Number(item.predicted_revenue) || 0,
          predicted_expenses: Number(item.predicted_expenses) || 0
        }));
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
        <CardTitle>Financial Forecasting</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={forecasts}>
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
  );
};
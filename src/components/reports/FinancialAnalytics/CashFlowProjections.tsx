import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";

export const CashFlowProjections = () => {
  const { data: projections, isLoading } = useQuery({
    queryKey: ["revenue-forecasts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("revenue_forecasts")
        .select("*")
        .order("forecast_date");

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cash Flow Projections</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <Skeleton className="w-full h-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cash Flow Projections</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={projections} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="forecast_date" 
                tickFormatter={(date) => new Date(date).toLocaleDateString()}
              />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip 
                formatter={(value) => formatCurrency(Number(value))}
                labelFormatter={(date) => new Date(date).toLocaleDateString()}
              />
              <Line 
                type="monotone" 
                dataKey="predicted_revenue" 
                stroke="#8884d8" 
                name="Projected Revenue"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
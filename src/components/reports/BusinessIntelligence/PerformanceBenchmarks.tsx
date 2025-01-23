import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";

export const PerformanceBenchmarks = () => {
  const { data: benchmarks, isLoading } = useQuery({
    queryKey: ["performance-benchmarks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("performance_benchmarks")
        .select("*")
        .order("category");

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance Benchmarks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <Skeleton className="w-full h-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatValue = (value: number, unit: string) => {
    if (unit === "currency") return formatCurrency(value);
    if (unit === "percentage") return `${value}%`;
    return value;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Benchmarks</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={benchmarks} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="metric_name" />
              <YAxis 
                yAxisId="left"
                orientation="left"
                tickFormatter={(value) => formatValue(value, benchmarks?.[0]?.unit || "")}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === "Current Value" || name === "Benchmark Value") {
                    return [formatValue(value as number, benchmarks?.[0]?.unit || ""), name];
                  }
                  return [`${value}%`, name];
                }}
              />
              <Bar 
                yAxisId="left"
                dataKey="current_value" 
                name="Current Value"
                fill="#8884d8" 
              />
              <Bar 
                yAxisId="left"
                dataKey="benchmark_value" 
                name="Benchmark Value"
                fill="#82ca9d" 
              />
              <Bar 
                yAxisId="right"
                dataKey="percentile" 
                name="Industry Percentile"
                fill="#ffc658" 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
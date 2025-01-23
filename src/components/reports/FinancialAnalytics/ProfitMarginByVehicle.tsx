import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";

export const ProfitMarginByVehicle = () => {
  const { data: margins, isLoading } = useQuery({
    queryKey: ["vehicle-utilization-metrics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicle_utilization_metrics")
        .select(`
          vehicle_id,
          revenue_generated,
          operating_costs,
          roi_percentage,
          vehicles (
            make,
            model,
            year
          )
        `)
        .order("roi_percentage", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profit Margin by Vehicle Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <Skeleton className="w-full h-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const formattedData = margins?.map(margin => ({
    vehicle: `${margin.vehicles?.year} ${margin.vehicles?.make} ${margin.vehicles?.model}`,
    revenue: margin.revenue_generated,
    costs: margin.operating_costs,
    margin: margin.roi_percentage
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profit Margin by Vehicle Type</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formattedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="vehicle" />
              <YAxis yAxisId="left" tickFormatter={(value) => formatCurrency(value)} />
              <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `${value}%`} />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === "margin") return [`${value}%`, "Margin"];
                  return [formatCurrency(Number(value)), name];
                }}
              />
              <Bar yAxisId="left" dataKey="revenue" name="Revenue" fill="#82ca9d" />
              <Bar yAxisId="left" dataKey="costs" name="Costs" fill="#ff7c7c" />
              <Bar yAxisId="right" dataKey="margin" name="Margin" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Loader2 } from "lucide-react";

export const ResourceUtilization = () => {
  const { data: utilizationData, isLoading } = useQuery({
    queryKey: ["resource-utilization"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicle_utilization_metrics")
        .select("*")
        .order("timestamp", { ascending: true });

      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resource Utilization Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={utilizationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis />
              <Tooltip
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value: number) => `${value.toFixed(2)}%`}
              />
              <Line 
                type="monotone" 
                dataKey="utilization_rate" 
                stroke="#8884d8" 
                name="Utilization Rate"
              />
              <Line 
                type="monotone" 
                dataKey="roi_percentage" 
                stroke="#82ca9d" 
                name="ROI"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
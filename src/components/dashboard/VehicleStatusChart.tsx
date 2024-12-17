import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const COLORS = {
  available: "#6B8AF4",
  on_rent: "#1E4DB7",
  in_repair: "#4DD0E1",
  out_of_service: "#FFC107",
  stolen: "#FF8A80",
  reserved: "#9C27B0",
  accident: "#4CAF50",
  police: "#009688"
};

export const VehicleStatusChart = () => {
  const { data: vehicles, isLoading } = useQuery({
    queryKey: ["vehicle-status"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicles")
        .select("status");
      
      if (error) throw error;
      
      // Count vehicles by status
      const statusCount = data.reduce((acc: Record<string, number>, vehicle) => {
        acc[vehicle.status] = (acc[vehicle.status] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(statusCount).map(([status, count]) => ({
        name: status.split('_').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' '),
        value: count,
        color: COLORS[status as keyof typeof COLORS]
      }));
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  const totalVehicles = vehicles?.reduce((sum, item) => sum + item.value, 0) || 0;
  const availableVehicles = vehicles?.find(item => item.name === "Available")?.value || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vehicle Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={vehicles}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={120}
                paddingAngle={2}
                dataKey="value"
              >
                {vehicles?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Legend
                layout="vertical"
                align="right"
                verticalAlign="middle"
                formatter={(value, entry: any) => (
                  <span className="text-sm">
                    {value} - {entry.payload.value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <div className="text-4xl font-bold">{availableVehicles}</div>
            <div className="text-sm text-muted-foreground">Available</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
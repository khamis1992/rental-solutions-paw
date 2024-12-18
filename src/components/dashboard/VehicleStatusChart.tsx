import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

export const VehicleStatusChart = () => {
  const { data: vehicleCounts, isLoading } = useQuery({
    queryKey: ["vehicle-status-counts"],
    queryFn: async () => {
      console.log("Fetching vehicle status counts...");
      const { data: vehicles, error } = await supabase
        .from("vehicles")
        .select("status");

      if (error) {
        console.error("Error fetching vehicles:", error);
        throw error;
      }

      // Count vehicles by status
      const counts = vehicles.reduce((acc, vehicle) => {
        const status = vehicle.status || 'unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      // Transform to array format for chart
      const data = Object.entries(counts).map(([status, count]) => ({
        status: status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        count: count,
      }));

      console.log("Vehicle counts:", data);
      return data;
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Status Analysis</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="animate-pulse w-full h-full bg-muted rounded-md" />
        </CardContent>
      </Card>
    );
  }

  const chartConfig = {
    available: {
      theme: { light: "#10b981", dark: "#34d399" }
    },
    maintenance: {
      theme: { light: "#f97316", dark: "#fb923c" }
    },
    police_station: {
      theme: { light: "#3b82f6", dark: "#60a5fa" }
    },
    accident: {
      theme: { light: "#dc2626", dark: "#ef4444" }
    },
    reserve: {
      theme: { light: "#059669", dark: "#10b981" }
    },
    stolen: {
      theme: { light: "#7c3aed", dark: "#8b5cf6" }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vehicle Status Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vehicleCounts} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <XAxis 
                  dataKey="status" 
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  interval={0}
                  tick={{ fontSize: 12 }}
                />
                <YAxis allowDecimals={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload) return null;
                    return (
                      <ChartTooltipContent
                        className="bg-background border-border"
                        payload={payload}
                      />
                    );
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="var(--color-available)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};
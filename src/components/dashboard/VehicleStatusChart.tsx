import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

const COLORS = {
  accident: "#2DD4BF",
  available: "#4F7BE4",
  maintenance: "#4FD1C5",
  police_station: "#2DD4BF",
  out_of_service: "#CA8A04",
  stolen: "#EF4444",
  reserve: "#8B5CF6",
  on_rent: "#1E40AF"
};

type VehicleStatus = keyof typeof COLORS;

const config = {
  colors: COLORS,
  theme: {
    light: "#E2E8F0",
    dark: "#334155",
  },
};

export const VehicleStatusChart = () => {
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

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
      }, {} as Record<string, number>);

      // Transform to array format for chart
      const data = Object.entries(counts).map(([status, count]) => ({
        name: status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        value: count,
        color: COLORS[status as VehicleStatus] || "#CBD5E1"
      }));

      console.log("Vehicle counts:", data);
      return data;
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="h-[400px] flex items-center justify-center">
          <div className="animate-pulse w-full h-full bg-muted rounded-md" />
        </CardContent>
      </Card>
    );
  }

  const filteredData = selectedStatus === "all" 
    ? vehicleCounts 
    : vehicleCounts?.filter(item => 
        item.name.toLowerCase() === selectedStatus.toLowerCase()
      );

  // Find the status with the highest count for center display
  const primaryStatus = filteredData?.reduce((prev, current) => 
    (prev.value > current.value) ? prev : current
  );

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Vehicle Status</h3>
          <Select 
            value={selectedStatus} 
            onValueChange={setSelectedStatus}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Vehicle Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Vehicle Types</SelectItem>
              {vehicleCounts?.map((status) => (
                <SelectItem key={status.name} value={status.name.toLowerCase()}>
                  {status.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-8">
          <div className="relative flex-1">
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-4xl font-bold">{primaryStatus?.value}</span>
              <span className="text-xl">{primaryStatus?.name}</span>
            </div>
            <ChartContainer config={config}>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={filteredData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {filteredData?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      return (
                        <ChartTooltipContent
                          className="bg-background border-border"
                          payload={payload}
                        />
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>

          <div className="w-[200px] space-y-3 py-4">
            {vehicleCounts?.map((status, index) => (
              <div 
                key={index} 
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => setSelectedStatus(status.name.toLowerCase())}
              >
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: status.color }}
                />
                <span className="flex-1">
                  {status.name}
                </span>
                <span className="font-semibold">
                  {status.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
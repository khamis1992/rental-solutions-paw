import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { ChartStatusSelect } from "./charts/ChartStatusSelect";
import { DonutChart } from "./charts/DonutChart";
import { ChartLegend } from "./charts/ChartLegend";

const STATUS_COLORS = {
  accident: "#F97316",      // Bright Orange
  available: "#0EA5E9",     // Ocean Blue
  maintenance: "#800000",   // Maroon
  police_station: "#D946EF", // Magenta Pink
  out_of_service: "#CA8A04", // Yellow
  stolen: "#EF4444",        // Red
  reserve: "#8B5CF6",       // Vivid Purple
  on_rent: "#22C55E"        // Green
} as const;

type VehicleStatus = keyof typeof STATUS_COLORS;

const config = {
  ...Object.entries(STATUS_COLORS).reduce((acc, [key, value]) => ({
    ...acc,
    [key]: {
      color: value,
    },
  }), {}),
  background: {
    theme: {
      light: "#E2E8F0",
      dark: "#334155",
    }
  }
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

      const counts = vehicles.reduce((acc, vehicle) => {
        const status = vehicle.status || 'unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const data = Object.entries(counts).map(([status, count]) => ({
        name: status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        value: count,
        color: STATUS_COLORS[status as VehicleStatus] || "#CBD5E1"
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

  const totalVehicles = vehicleCounts?.reduce((sum, item) => sum + item.value, 0) || 0;

  const primaryStatus = selectedStatus === "all"
    ? { value: totalVehicles, name: "Total Vehicles" }
    : filteredData?.reduce((prev, current) => 
        (prev.value > current.value) ? prev : current
      );

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Vehicle Status</h3>
          <ChartStatusSelect
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            statusData={vehicleCounts || []}
          />
        </div>

        <div className="flex gap-8">
          <DonutChart
            data={filteredData || []}
            config={config}
            primaryStatus={primaryStatus}
          />
          <ChartLegend
            data={vehicleCounts || []}
            onStatusSelect={setSelectedStatus}
          />
        </div>
      </CardContent>
    </Card>
  );
};
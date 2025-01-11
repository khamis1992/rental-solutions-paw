import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useMemo } from "react";
import { ChartStatusSelect } from "./charts/ChartStatusSelect";
import { DonutChart } from "./charts/DonutChart";
import { ChartLegend } from "./charts/ChartLegend";
import { toast } from "@/components/ui/use-toast";

const STATUS_COLORS = {
  accident: "#F97316",      // Orange
  available: "#0EA5E9",     // Blue
  maintenance: "#800000",   // Maroon
  police_station: "#D946EF", // Magenta
  rented: "#94A3B8",        // Gray
  stolen: "#EF4444",        // Red
  reserve: "#8B5CF6",       // Purple
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

  const { data: vehicleCounts, isLoading, error } = useQuery({
    queryKey: ["vehicle-status-counts"],
    queryFn: async () => {
      console.log("Fetching vehicle status counts...");
      const { data: vehicles, error } = await supabase
        .from("vehicles")
        .select("status");

      if (error) {
        console.error("Error fetching vehicles:", error);
        toast({
          title: "Error",
          description: "Failed to fetch vehicle status data",
          variant: "destructive",
        });
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
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const filteredData = useMemo(() => {
    if (!vehicleCounts) return [];
    return selectedStatus === "all" 
      ? vehicleCounts 
      : vehicleCounts.filter(item => 
          item.name.toLowerCase() === selectedStatus.toLowerCase()
        );
  }, [vehicleCounts, selectedStatus]);

  const totalVehicles = useMemo(() => 
    vehicleCounts?.reduce((sum, item) => sum + item.value, 0) || 0,
    [vehicleCounts]
  );

  if (isLoading) {
    return (
      <Card className="bg-white">
        <CardContent className="h-[400px] flex items-center justify-center">
          <div className="animate-pulse w-full h-full bg-muted rounded-md" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-white">
        <CardContent className="h-[400px] flex items-center justify-center">
          <div className="text-destructive">Failed to load vehicle status data</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white">
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Vehicle Status</h3>
          <ChartStatusSelect
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            statusData={vehicleCounts || []}
          />
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
          <div className="w-full md:w-2/3 flex justify-center">
            <DonutChart
              data={filteredData}
              config={config}
              primaryValue={totalVehicles}
              primaryLabel="Total Vehicles"
            />
          </div>
          <div className="w-full md:w-1/3">
            <ChartLegend
              data={vehicleCounts || []}
              onStatusSelect={setSelectedStatus}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
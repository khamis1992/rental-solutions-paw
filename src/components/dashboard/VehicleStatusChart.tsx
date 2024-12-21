import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const STATUS_COLORS = {
  on_route: "#F97316",    // Orange
  available: "#0EA5E9",   // Blue
  out_of_service: "#EF4444", // Red
} as const;

export const VehicleStatusChart = () => {
  const navigate = useNavigate();
  
  const { data: vehicleCounts, isLoading } = useQuery({
    queryKey: ["vehicle-status-counts"],
    queryFn: async () => {
      const { data: vehicles, error } = await supabase
        .from("vehicles")
        .select("status");

      if (error) {
        console.error("Error fetching vehicles:", error);
        throw error;
      }

      const counts = {
        on_route: vehicles.filter(v => v.status === 'on_rent').length,
        available: vehicles.filter(v => v.status === 'available').length,
        out_of_service: vehicles.filter(v => v.status === 'out_of_service').length,
      };

      return counts;
    },
  });

  const totalVehicles = vehicleCounts ? 
    Object.values(vehicleCounts).reduce((sum, count) => sum + count, 0) : 0;

  // Calculate the stroke dash values for the circular progress
  const calculateStrokeDash = (value: number) => {
    const circumference = 2 * Math.PI * 90; // radius = 90
    return (value / totalVehicles) * circumference;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="h-[200px] flex items-center justify-center">
          <div className="animate-pulse w-full h-full bg-muted rounded-md" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative">
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-lg font-semibold">Total Vehicles</h3>
          <Button
            variant="link"
            className="text-primary hover:text-primary/90"
            onClick={() => navigate('/vehicles/new')}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Vehicle
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div className="relative w-[200px] h-[200px]">
            {/* Total vehicles in the center */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold">{totalVehicles}</span>
              <span className="text-sm text-muted-foreground">Vehicles</span>
            </div>

            {/* SVG for the circular progress */}
            <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
              {/* Background circle */}
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke="#f1f1f1"
                strokeWidth="8"
              />
              
              {/* Progress segments */}
              {vehicleCounts && [
                { key: 'on_route', offset: 0 },
                { key: 'available', offset: calculateStrokeDash(vehicleCounts.on_route) },
                { key: 'out_of_service', offset: calculateStrokeDash(vehicleCounts.on_route + vehicleCounts.available) }
              ].map(({ key, offset }) => (
                <circle
                  key={key}
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke={STATUS_COLORS[key as keyof typeof STATUS_COLORS]}
                  strokeWidth="8"
                  strokeDasharray={`${calculateStrokeDash(vehicleCounts[key as keyof typeof vehicleCounts])} ${2 * Math.PI * 90}`}
                  strokeDashoffset={offset}
                  style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                />
              ))}
            </svg>
          </div>

          {/* Legend */}
          <div className="space-y-4">
            {vehicleCounts && [
              { label: 'On Route', value: vehicleCounts.on_route, color: STATUS_COLORS.on_route },
              { label: 'Available', value: vehicleCounts.available, color: STATUS_COLORS.available },
              { label: 'Out of Service', value: vehicleCounts.out_of_service, color: STATUS_COLORS.out_of_service }
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-sm font-medium">{label}</span>
                <span className="text-sm font-bold">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
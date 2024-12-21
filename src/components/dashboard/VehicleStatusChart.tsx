import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const STATUS_COLORS = {
  rented: "#FFB74D",    // Warm Orange for "ON ROUTE"
  available: "#4CAF50", // Green for "AVAILABLE"
  maintenance: "#EF5350", // Red for "OUT OF SERVICE"
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
        rented: vehicles.filter(v => v.status === 'rented').length,
        available: vehicles.filter(v => v.status === 'available').length,
        maintenance: vehicles.filter(v => v.status === 'maintenance').length,
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
    <Card className="relative bg-white shadow-sm">
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-lg font-medium text-gray-900">Total Vehicles</h3>
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
            {/* Background circles for depth effect */}
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke="#f5f5f5"
                strokeWidth="12"
              />
              <circle
                cx="100"
                cy="100"
                r="78"
                fill="none"
                stroke="#fafafa"
                strokeWidth="12"
              />
              <circle
                cx="100"
                cy="100"
                r="66"
                fill="none"
                stroke="#f5f5f5"
                strokeWidth="12"
              />
            </svg>

            {/* Total vehicles in the center */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-gray-900">{totalVehicles}</span>
              <span className="text-sm text-gray-500">Vehicles</span>
            </div>

            {/* Progress segments */}
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              {vehicleCounts && [
                { key: 'rented', offset: 0 },
                { key: 'available', offset: calculateStrokeDash(vehicleCounts.rented) },
                { key: 'maintenance', offset: calculateStrokeDash(vehicleCounts.rented + vehicleCounts.available) }
              ].map(({ key, offset }) => (
                <circle
                  key={key}
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke={STATUS_COLORS[key as keyof typeof STATUS_COLORS]}
                  strokeWidth="12"
                  strokeDasharray={`${calculateStrokeDash(vehicleCounts[key as keyof typeof vehicleCounts])} ${2 * Math.PI * 90}`}
                  strokeDashoffset={offset}
                  style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                />
              ))}
            </svg>
          </div>

          {/* Legend with updated styling */}
          <div className="space-y-4 pr-4">
            {vehicleCounts && [
              { label: 'ON ROUTE', value: vehicleCounts.rented, color: STATUS_COLORS.rented },
              { label: 'AVAILABLE', value: vehicleCounts.available, color: STATUS_COLORS.available },
              { label: 'OUT OF SERVICE', value: vehicleCounts.maintenance, color: STATUS_COLORS.maintenance }
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">{value}</span>
                  <span className="text-xs font-medium text-gray-500">{label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
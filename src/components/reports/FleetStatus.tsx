import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Car, Wrench, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export const FleetStatus = () => {
  const { data: fleetData } = useQuery({
    queryKey: ["fleet-status"],
    queryFn: async () => {
      const { data: vehicles, error } = await supabase
        .from("vehicles")
        .select(`
          *,
          maintenance (
            cost,
            status
          )
        `);

      if (error) throw error;
      return vehicles;
    },
  });

  const totalVehicles = fleetData?.length || 0;
  const availableVehicles = fleetData?.filter(v => v.status === 'available').length || 0;
  const maintenanceVehicles = fleetData?.filter(v => v.status === 'maintenance').length || 0;

  const maintenanceCosts = fleetData?.reduce((acc, vehicle) => {
    const costs = vehicle.maintenance?.reduce((sum: number, record: any) => 
      sum + (record.cost || 0), 0) || 0;
    return acc + costs;
  }, 0) || 0;

  const vehicleStatusData = [
    { name: 'Available', value: availableVehicles },
    { name: 'In Maintenance', value: maintenanceVehicles },
    { name: 'Rented', value: totalVehicles - availableVehicles - maintenanceVehicles }
  ];

  const COLORS = ['#4CAF50', '#FF9800', '#2196F3'];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          title="Total Vehicles"
          value={totalVehicles.toString()}
          icon={Car}
          description="Fleet size"
          className="bg-white"
        />
        <StatsCard
          title="Available Vehicles"
          value={availableVehicles.toString()}
          icon={AlertTriangle}
          description={`${((availableVehicles / totalVehicles) * 100).toFixed(1)}% availability`}
          className="bg-white"
        />
        <StatsCard
          title="Maintenance Costs"
          value={formatCurrency(maintenanceCosts)}
          icon={Wrench}
          description="Total maintenance expenses"
          className="bg-white"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fleet Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={vehicleStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {vehicleStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
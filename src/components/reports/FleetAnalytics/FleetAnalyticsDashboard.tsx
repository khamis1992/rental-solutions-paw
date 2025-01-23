import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { Car, TrendingUp, Wrench, DollarSign } from "lucide-react";

export const FleetAnalyticsDashboard = () => {
  const { data: fleetStats } = useQuery({
    queryKey: ["fleet-stats"],
    queryFn: async () => {
      const { data: vehicles, error } = await supabase
        .from("vehicles")
        .select(`
          *,
          leases (
            total_amount,
            status
          ),
          maintenance (
            cost
          )
        `);

      if (error) throw error;

      const totalVehicles = vehicles.length;
      const totalRevenue = vehicles.reduce((acc, vehicle) => {
        return acc + (vehicle.leases?.reduce((sum, lease) => sum + (lease.total_amount || 0), 0) || 0);
      }, 0);

      const totalMaintenance = vehicles.reduce((acc, vehicle) => {
        return acc + (vehicle.maintenance?.reduce((sum, m) => sum + (m.cost || 0), 0) || 0);
      }, 0);

      const activeLeases = vehicles.reduce((acc, vehicle) => {
        return acc + (vehicle.leases?.filter(lease => lease.status === 'active').length || 0);
      }, 0);

      return {
        totalVehicles,
        totalRevenue,
        totalMaintenance,
        activeLeases,
        averageRevenuePerVehicle: totalVehicles ? totalRevenue / totalVehicles : 0,
        fleetUtilization: (activeLeases / totalVehicles) * 100
      };
    }
  });

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium truncate">Total Fleet Value</CardTitle>
            <Car className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate">{formatCurrency(fleetStats?.totalRevenue || 0)}</div>
            <p className="text-sm text-muted-foreground mt-2 truncate">
              {fleetStats?.totalVehicles} vehicles in fleet
            </p>
          </CardContent>
        </Card>

        <Card className="p-6 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium truncate">Fleet Utilization</CardTitle>
            <TrendingUp className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate">
              {fleetStats?.fleetUtilization.toFixed(1)}%
            </div>
            <p className="text-sm text-muted-foreground mt-2 truncate">
              {fleetStats?.activeLeases} active leases
            </p>
          </CardContent>
        </Card>

        <Card className="p-6 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium truncate">Maintenance Costs</CardTitle>
            <Wrench className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate">{formatCurrency(fleetStats?.totalMaintenance || 0)}</div>
            <p className="text-sm text-muted-foreground mt-2 truncate">
              Total maintenance expenses
            </p>
          </CardContent>
        </Card>

        <Card className="p-6 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium truncate">Avg. Revenue/Vehicle</CardTitle>
            <DollarSign className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate">
              {formatCurrency(fleetStats?.averageRevenuePerVehicle || 0)}
            </div>
            <p className="text-sm text-muted-foreground mt-2 truncate">
              Per vehicle revenue
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
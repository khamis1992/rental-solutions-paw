import { StatsCard } from "@/components/dashboard/StatsCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { Car, TrendingUp, Wrench, DollarSign } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export const FleetAnalyticsDashboard = () => {
  const { data: fleetStats, isLoading, error } = useQuery({
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

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error loading fleet statistics. Please try again later.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-[200px] w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2">
        <StatsCard
          title="Total Fleet Value"
          value={formatCurrency(fleetStats?.totalRevenue || 0)}
          icon={Car}
          description={`${fleetStats?.totalVehicles || 0} vehicles in fleet`}
          className="bg-white p-8 shadow-lg hover:shadow-xl transition-shadow"
          iconClassName="text-primary h-6 w-6"
        />

        <StatsCard
          title="Fleet Utilization"
          value={`${fleetStats?.fleetUtilization.toFixed(1)}%`}
          icon={TrendingUp}
          description={`${fleetStats?.activeLeases || 0} active leases`}
          className="bg-white p-8 shadow-lg hover:shadow-xl transition-shadow"
          iconClassName="text-green-500 h-6 w-6"
        />

        <StatsCard
          title="Maintenance Costs"
          value={formatCurrency(fleetStats?.totalMaintenance || 0)}
          icon={Wrench}
          description="Total maintenance expenses"
          className="bg-white p-8 shadow-lg hover:shadow-xl transition-shadow"
          iconClassName="text-orange-500 h-6 w-6"
        />

        <StatsCard
          title="Avg. Revenue/Vehicle"
          value={formatCurrency(fleetStats?.averageRevenuePerVehicle || 0)}
          icon={DollarSign}
          description="Per vehicle revenue"
          className="bg-white p-8 shadow-lg hover:shadow-xl transition-shadow"
          iconClassName="text-blue-500 h-6 w-6"
        />
      </div>
    </div>
  );
};
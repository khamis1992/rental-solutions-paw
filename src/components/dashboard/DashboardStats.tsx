import { Car, DollarSign, FileText, ArrowUpRight } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { VehicleStatusChart } from "@/components/dashboard/VehicleStatusChart";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/utils";

export const DashboardStats = () => {
  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const [vehiclesResponse, rentalsResponse, paymentsResponse] = await Promise.all([
        // Get vehicles stats
        supabase.from("vehicles")
          .select('status', { count: 'exact' })
          .in('status', ['available', 'maintenance', 'on_rent']),

        // Get active rentals
        supabase.from("leases")
          .select('status', { count: 'exact' })
          .eq("status", "active"),

        // Calculate monthly revenue
        supabase.from("payments")
          .select('amount')
          .gte('created_at', new Date(new Date().setDate(1)).toISOString())
          .eq("status", "completed")
      ]);

      if (vehiclesResponse.error) throw vehiclesResponse.error;
      if (rentalsResponse.error) throw rentalsResponse.error;
      if (paymentsResponse.error) throw paymentsResponse.error;

      const monthlyRevenue = paymentsResponse.data?.reduce((sum, payment) => 
        sum + (payment.amount || 0), 0) || 0;

      const vehicleCounts = {
        total: vehiclesResponse.count || 0,
        available: vehiclesResponse.data?.filter(v => v.status === 'available').length || 0,
        maintenance: vehiclesResponse.data?.filter(v => v.status === 'maintenance').length || 0,
        onRent: vehiclesResponse.data?.filter(v => v.status === 'on_rent').length || 0
      };

      return {
        totalVehicles: vehicleCounts.total,
        availableVehicles: vehicleCounts.available,
        activeRentals: rentalsResponse.count || 0,
        monthlyRevenue,
        revenueGrowth: 0 // Calculate if needed
      };
    },
    staleTime: 60000, // Cache for 1 minute
    cacheTime: 300000, // Keep in cache for 5 minutes
  });

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Total Vehicles"
          value={stats?.totalVehicles.toString() || "0"}
          icon={Car}
          className="shadow-md hover:shadow-lg transition-shadow"
          iconClassName="h-6 w-6 text-blue-500"
          description={
            <span className="flex items-center text-emerald-600">
              <ArrowUpRight className="mr-1 h-4 w-4" />
              {stats?.availableVehicles || 0} available
            </span>
          }
        />
        <StatsCard
          title="Active Rentals"
          value={stats?.activeRentals.toString() || "0"}
          icon={FileText}
          className="shadow-md hover:shadow-lg transition-shadow"
          iconClassName="h-6 w-6 text-purple-500"
        />
        <StatsCard
          title="Monthly Revenue"
          value={formatCurrency(stats?.monthlyRevenue || 0)}
          icon={DollarSign}
          className="shadow-md hover:shadow-lg transition-shadow"
          iconClassName="h-6 w-6 text-green-500"
          description={
            stats?.revenueGrowth ? (
              <span className="flex items-center text-emerald-600">
                <ArrowUpRight className="mr-1 h-4 w-4" />
                {stats.revenueGrowth.toFixed(1)}% from last month
              </span>
            ) : null
          }
        />
      </div>
      
      <VehicleStatusChart />
    </div>
  );
};

export default DashboardStats;
import { Car, DollarSign, FileText, ArrowUpRight, TrendingUp } from "lucide-react";
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
          .select('status', { count: 'exact' }),

        // Get active rentals
        supabase.from("leases")
          .select('status', { count: 'exact', head: true })
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

      const totalVehicles = vehiclesResponse.count || 0;
      const pendingReturns = 2; // This would need to be calculated from actual data

      return {
        totalVehicles,
        activeRentals: rentalsResponse.count || 0,
        monthlyRevenue,
        pendingReturns,
        growth: {
          vehicles: "+213 this month",
          revenue: "9.6% from last month"
        }
      };
    },
    staleTime: 60000, // Cache for 1 minute
  });

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-3">
        <StatsCard
          title="Total Vehicles"
          value={stats?.totalVehicles.toString() || "0"}
          icon={Car}
          className="bg-white"
          iconClassName="h-6 w-6 text-blue-500"
          description={
            <span className="flex items-center text-emerald-600 text-sm">
              <TrendingUp className="mr-1 h-4 w-4" />
              {stats?.growth.vehicles}
            </span>
          }
        />
        <StatsCard
          title="Active Rentals"
          value={stats?.activeRentals.toString() || "0"}
          icon={FileText}
          className="bg-white"
          iconClassName="h-6 w-6 text-purple-500"
          description={
            <span className="text-amber-600 text-sm">
              {stats?.pendingReturns} pending returns
            </span>
          }
        />
        <StatsCard
          title="Monthly Revenue"
          value={`QAR ${formatCurrency(stats?.monthlyRevenue || 0, false)}`}
          icon={DollarSign}
          className="bg-white"
          iconClassName="h-6 w-6 text-green-500"
          description={
            <span className="flex items-center text-emerald-600 text-sm">
              <TrendingUp className="mr-1 h-4 w-4" />
              {stats?.growth.revenue}
            </span>
          }
        />
      </div>
      
      <VehicleStatusChart />
    </div>
  );
};

export default DashboardStats;
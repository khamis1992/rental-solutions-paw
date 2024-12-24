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
      const [vehiclesResponse, rentalsResponse, paymentsResponse, lastMonthPaymentsResponse, newVehiclesResponse, pendingReturnsResponse] = await Promise.all([
        // Get vehicles stats
        supabase.from("vehicles")
          .select('status', { count: 'exact' })
          .eq('is_test_data', false),

        // Get active rentals
        supabase.from("leases")
          .select('status', { count: 'exact', head: true })
          .eq("status", "active"),

        // Calculate current month revenue
        supabase.from("payments")
          .select('amount')
          .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
          .eq('status', 'completed'),

        // Calculate last month revenue for comparison
        supabase.from("payments")
          .select('amount')
          .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString())
          .lt('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
          .eq('status', 'completed'),

        // Get new vehicles added this month
        supabase.from("vehicles")
          .select('id', { count: 'exact' })
          .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
          .eq('is_test_data', false),

        // Get pending returns (leases that are active and past their end date)
        supabase.from("leases")
          .select('id', { count: 'exact' })
          .eq('status', 'active')
          .lt('end_date', new Date().toISOString())
      ]);

      if (vehiclesResponse.error) throw vehiclesResponse.error;
      if (rentalsResponse.error) throw rentalsResponse.error;
      if (paymentsResponse.error) throw paymentsResponse.error;
      if (lastMonthPaymentsResponse.error) throw lastMonthPaymentsResponse.error;
      if (newVehiclesResponse.error) throw newVehiclesResponse.error;
      if (pendingReturnsResponse.error) throw pendingReturnsResponse.error;

      const monthlyRevenue = paymentsResponse.data?.reduce((sum, payment) => 
        sum + (payment.amount || 0), 0) || 0;

      const lastMonthRevenue = lastMonthPaymentsResponse.data?.reduce((sum, payment) => 
        sum + (payment.amount || 0), 0) || 0;

      // Calculate growth percentage
      const growth = lastMonthRevenue > 0 
        ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
        : 0;

      const totalVehicles = vehiclesResponse.count || 0;
      const newVehicles = newVehiclesResponse.count || 0;
      const pendingReturns = pendingReturnsResponse.count || 0;

      return {
        totalVehicles,
        activeRentals: rentalsResponse.count || 0,
        monthlyRevenue,
        pendingReturns,
        growth: {
          vehicles: `+${newVehicles} this month`,
          revenue: `${growth.toFixed(1)}% from last month`
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
          value={formatCurrency(stats?.monthlyRevenue || 0)}
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
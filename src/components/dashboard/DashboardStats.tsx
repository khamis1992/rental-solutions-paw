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
      // Get total vehicles
      const { count: totalVehicles } = await supabase
        .from("vehicles")
        .select("*", { count: "exact", head: true });

      // Get vehicles added this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const { count: newVehicles } = await supabase
        .from("vehicles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", startOfMonth.toISOString());

      // Get active rentals
      const { count: activeRentals } = await supabase
        .from("leases")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      // Get pending returns
      const { count: pendingReturns } = await supabase
        .from("leases")
        .select("*", { count: "exact", head: true })
        .eq("status", "active")
        .lt("end_date", new Date().toISOString());

      // Calculate monthly revenue
      const { data: monthlyPayments } = await supabase
        .from("payments")
        .select("amount")
        .gte("created_at", startOfMonth.toISOString())
        .eq("status", "completed");

      const monthlyRevenue = monthlyPayments?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;

      // Get last month's revenue for comparison
      const lastMonth = new Date(startOfMonth);
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      
      const { data: lastMonthPayments } = await supabase
        .from("payments")
        .select("amount")
        .gte("created_at", lastMonth.toISOString())
        .lt("created_at", startOfMonth.toISOString())
        .eq("status", "completed");

      const lastMonthRevenue = lastMonthPayments?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;

      const revenueGrowth = lastMonthRevenue ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;

      return {
        totalVehicles: totalVehicles || 0,
        newVehicles: newVehicles || 0,
        activeRentals: activeRentals || 0,
        pendingReturns: pendingReturns || 0,
        monthlyRevenue,
        revenueGrowth
      };
    },
  });

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="Total Vehicles"
          value={stats?.totalVehicles.toString() || "0"}
          icon={Car}
          description={
            <span className="flex items-center text-emerald-600">
              <ArrowUpRight className="mr-1 h-4 w-4" />
              +{stats?.newVehicles || 0} this month
            </span>
          }
        />
        <StatsCard
          title="Active Rentals"
          value={stats?.activeRentals.toString() || "0"}
          icon={FileText}
          description={
            <span className="flex items-center text-yellow-600">
              {stats?.pendingReturns || 0} pending returns
            </span>
          }
        />
        <StatsCard
          title="Monthly Revenue"
          value={formatCurrency(stats?.monthlyRevenue || 0)}
          icon={DollarSign}
          description={
            <span className="flex items-center text-emerald-600">
              <ArrowUpRight className="mr-1 h-4 w-4" />
              {stats?.revenueGrowth.toFixed(1)}% from last month
            </span>
          }
        />
      </div>
      
      {/* Vehicle Status Analysis Chart */}
      <VehicleStatusChart />
    </div>
  );
};
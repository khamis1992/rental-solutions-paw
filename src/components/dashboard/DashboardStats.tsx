import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Car, DollarSign, FileText, ArrowUpRight, TrendingUp } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { VehicleStatusChart } from "@/components/dashboard/VehicleStatusChart";
import { formatCurrency } from "@/lib/utils";

export const DashboardStats = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_dashboard_stats');
      
      if (error) {
        console.error("Error fetching dashboard stats:", error);
        throw error;
      }

      // Provide default values if data is null/undefined
      return {
        total_vehicles: data?.total_vehicles ?? 0,
        available_vehicles: data?.available_vehicles ?? 0,
        rented_vehicles: data?.rented_vehicles ?? 0,
        maintenance_vehicles: data?.maintenance_vehicles ?? 0,
        total_customers: data?.total_customers ?? 0,
        active_rentals: data?.active_rentals ?? 0,
        monthly_revenue: data?.monthly_revenue ?? 0
      };
    }
  });

  if (isLoading) {
    return <div className="text-center py-4">Loading stats...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-3">
        <StatsCard
          title="Total Vehicles"
          value={String(stats?.total_vehicles || 0)}
          icon={Car}
          className="bg-white"
          iconClassName="h-5 w-5 text-blue-500"
          description={
            <span className="flex items-center text-emerald-600 text-xs">
              <TrendingUp className="mr-1 h-4 w-4" />
              {`${stats?.available_vehicles || 0} available`}
            </span>
          }
        />
        <StatsCard
          title="Active Rentals"
          value={String(stats?.active_rentals || 0)}
          icon={FileText}
          className="bg-white"
          iconClassName="h-5 w-5 text-purple-500"
          description={
            <span className="text-amber-600 text-xs">
              {`${stats?.rented_vehicles || 0} rented vehicles`}
            </span>
          }
        />
        <StatsCard
          title="Monthly Revenue"
          value={formatCurrency(stats?.monthly_revenue || 0)}
          icon={DollarSign}
          className="bg-white"
          iconClassName="h-5 w-5 text-green-500"
          description={
            <span className="flex items-center text-emerald-600 text-xs">
              <ArrowUpRight className="mr-1 h-4 w-4" />
              {`${stats?.maintenance_vehicles || 0} in maintenance`}
            </span>
          }
        />
      </div>
      
      <VehicleStatusChart />
    </div>
  );
};

export default DashboardStats;
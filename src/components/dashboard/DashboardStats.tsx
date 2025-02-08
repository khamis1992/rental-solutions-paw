
import { Car, Users, FileText, DollarSign, TrendingUp, ChevronUp, ChevronDown } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/utils";

interface DashboardStatsData {
  totalVehicles: number;
  availableVehicles: number;
  rentedVehicles: number;
  maintenanceVehicles: number;
  totalCustomers: number;
  activeRentals: number;
  monthlyRevenue: number;
}

export const DashboardStats = () => {
  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_dashboard_stats");
      if (error) throw error;
      
      // Ensure we convert the snake_case response to camelCase and handle potential null values
      return {
        totalVehicles: Number(data.total_vehicles) || 0,
        availableVehicles: Number(data.available_vehicles) || 0,
        rentedVehicles: Number(data.rented_vehicles) || 0,
        maintenanceVehicles: Number(data.maintenance_vehicles) || 0,
        totalCustomers: Number(data.total_customers) || 0,
        activeRentals: Number(data.active_rentals) || 0,
        monthlyRevenue: Number(data.monthly_revenue) || 0
      } as DashboardStatsData;
    },
    placeholderData: {
      totalVehicles: 0,
      availableVehicles: 0,
      rentedVehicles: 0,
      maintenanceVehicles: 0,
      totalCustomers: 0,
      activeRentals: 0,
      monthlyRevenue: 0
    }
  });

  const calculatePercentage = (value: number, total: number) => {
    if (total === 0) return 0;
    return ((value / total) * 100).toFixed(1);
  };

  // Ensure stats is defined before calculating percentages
  const availablePercentage = calculatePercentage(stats?.availableVehicles || 0, stats?.totalVehicles || 0);
  const rentedPercentage = calculatePercentage(stats?.rentedVehicles || 0, stats?.totalVehicles || 0);

  return (
    <>
      <StatsCard
        title="Total Fleet"
        value={stats?.totalVehicles?.toString() || "0"}
        icon={Car}
        description={
          <div className="flex items-center gap-1 text-emerald-600">
            <ChevronUp className="h-4 w-4" />
            <span>{availablePercentage}% available</span>
          </div>
        }
        className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10"
      />

      <StatsCard
        title="Active Rentals"
        value={stats?.activeRentals?.toString() || "0"}
        icon={FileText}
        description={
          <div className="flex items-center gap-1 text-blue-600">
            <TrendingUp className="h-4 w-4" />
            <span>{rentedPercentage}% of fleet</span>
          </div>
        }
        className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/10"
      />

      <StatsCard
        title="Total Customers"
        value={stats?.totalCustomers?.toString() || "0"}
        icon={Users}
        description={
          <div className="flex items-center gap-1 text-emerald-600">
            <ChevronUp className="h-4 w-4" />
            <span>Active accounts</span>
          </div>
        }
        className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/10"
      />

      <StatsCard
        title="Monthly Revenue"
        value={formatCurrency(stats?.monthlyRevenue || 0)}
        icon={DollarSign}
        description={
          <div className="flex items-center gap-1 text-amber-600">
            <ChevronUp className="h-4 w-4" />
            <span>vs last month</span>
          </div>
        }
        className="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-800/10"
      />
    </>
  );
};

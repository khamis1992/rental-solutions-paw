
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Car, Users, DollarSign, ChevronUp, ChevronDown, ArrowRight, Wrench } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { formatCurrency } from "@/lib/utils";

interface DashboardStatsProps {
  stats?: {
    totalVehicles: number;
    availableVehicles: number;
    rentedVehicles: number;
    maintenanceVehicles: number;
    totalCustomers: number;
    activeRentals: number;
    monthlyRevenue: number;
  };
}

export const DashboardStats = ({ stats }: DashboardStatsProps) => {
  const { data: vehicles, isLoading } = useQuery({
    queryKey: ["vehicle-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicles")
        .select("status");

      if (error) throw error;

      const counts = {
        total: data.length,
        available: data.filter(v => v.status === 'available').length,
        rented: data.filter(v => v.status === 'rented').length,
        maintenance: data.filter(v => v.status === 'maintenance').length
      };

      return counts;
    },
  });

  const calculatePercentage = (value: number, total: number) => {
    if (total === 0) return 0;
    return ((value / total) * 100).toFixed(1);
  };

  const availablePercentage = vehicles ? calculatePercentage(vehicles.available, vehicles.total) : 0;
  const rentedPercentage = vehicles ? calculatePercentage(vehicles.rented, vehicles.total) : 0;
  const maintenancePercentage = vehicles ? calculatePercentage(vehicles.maintenance, vehicles.total) : 0;

  return (
    <>
      <StatsCard
        title="Total Fleet"
        value={vehicles?.total.toString() || "0"}
        icon={Car}
        description={
          <div className="flex items-center gap-1 text-emerald-600">
            <ChevronUp className="h-4 w-4" />
            <span>{availablePercentage}% available</span>
          </div>
        }
        className="bg-gradient-to-br from-[#FDE1D3] to-[#FEC6A1] dark:from-orange-900/50 dark:to-orange-800/30"
      />

      <StatsCard
        title="Active Rentals"
        value={vehicles?.rented.toString() || "0"}
        icon={Users}
        description={
          <div className="flex items-center gap-1 text-primary">
            <ArrowRight className="h-4 w-4" />
            <span>{rentedPercentage}% of fleet</span>
          </div>
        }
        className="bg-gradient-to-br from-[#D3E4FD] to-[#B6D4FA] dark:from-blue-900/50 dark:to-blue-800/30"
      />

      <StatsCard
        title="Monthly Revenue"
        value={formatCurrency(stats?.monthlyRevenue || 0)}
        icon={DollarSign}
        description={
          <div className="flex items-center gap-1 text-emerald-600">
            <ChevronUp className="h-4 w-4" />
            <span>12% increase</span>
          </div>
        }
        className="bg-gradient-to-br from-[#E5DEFF] to-[#D3C6FF] dark:from-purple-900/50 dark:to-purple-800/30"
      />

      <StatsCard
        title="In Maintenance"
        value={vehicles?.maintenance.toString() || "0"}
        icon={Wrench}
        description={
          <div className="flex items-center gap-1 text-amber-600">
            <ChevronDown className="h-4 w-4" />
            <span>{maintenancePercentage}% of fleet</span>
          </div>
        }
        className="bg-gradient-to-br from-[#FFE5D3] to-[#FFD1B6] dark:from-red-900/50 dark:to-red-800/30"
      />
    </>
  );
};

export default DashboardStats;


import { Car, Users, FileText, DollarSign, ChevronUp, ChevronDown, ArrowRight, Wrench } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { formatCurrency } from "@/lib/utils";

interface DashboardStatsProps {
  stats: {
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
  const calculatePercentage = (value: number, total: number) => {
    if (total === 0) return 0;
    return ((value / total) * 100).toFixed(1);
  };

  const availablePercentage = calculatePercentage(stats.availableVehicles, stats.totalVehicles);
  const rentedPercentage = calculatePercentage(stats.rentedVehicles, stats.totalVehicles);
  const maintenancePercentage = calculatePercentage(stats.maintenanceVehicles, stats.totalVehicles);

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Total Fleet"
        value={stats.totalVehicles.toString()}
        icon={Car}
        description={
          <div className="flex items-center gap-1 text-emerald-600">
            <ChevronUp className="h-4 w-4" />
            <span>{availablePercentage}% available</span>
          </div>
        }
        iconClassName="text-blue-500"
      />

      <StatsCard
        title="Active Rentals"
        value={stats.activeRentals.toString()}
        icon={FileText}
        description={
          <div className="flex items-center gap-1 text-primary">
            <ArrowRight className="h-4 w-4" />
            <span>{rentedPercentage}% of fleet</span>
          </div>
        }
        iconClassName="text-purple-500"
      />

      <StatsCard
        title="Total Customers"
        value={stats.totalCustomers.toString()}
        icon={Users}
        description={
          <div className="flex items-center gap-1 text-emerald-600">
            <ChevronUp className="h-4 w-4" />
            <span>Active accounts</span>
          </div>
        }
        iconClassName="text-emerald-500"
      />

      <StatsCard
        title="Monthly Revenue"
        value={formatCurrency(stats.monthlyRevenue)}
        icon={DollarSign}
        description={
          <div className="flex items-center gap-1 text-amber-600">
            <Wrench className="h-4 w-4" />
            <span>{maintenancePercentage}% in maintenance</span>
          </div>
        }
        iconClassName="text-amber-500"
      />
    </div>
  );
};

export default DashboardStats;

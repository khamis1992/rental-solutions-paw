import { Car, DollarSign, FileText, ArrowUpRight } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";

export const DashboardStats = () => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
      <StatsCard
        title="Total Vehicles"
        value="124"
        icon={Car}
        description={
          <span className="flex items-center text-emerald-600">
            <ArrowUpRight className="mr-1 h-4 w-4" />
            +2 this month
          </span>
        }
      />
      <StatsCard
        title="Active Rentals"
        value="89"
        icon={FileText}
        description={
          <span className="flex items-center text-yellow-600">
            23 pending returns
          </span>
        }
      />
      <StatsCard
        title="Monthly Revenue"
        value="$48,574"
        icon={DollarSign}
        description={
          <span className="flex items-center text-emerald-600">
            <ArrowUpRight className="mr-1 h-4 w-4" />
            +7.4% from last month
          </span>
        }
      />
    </div>
  );
};
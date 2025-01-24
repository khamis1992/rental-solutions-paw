import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StatsCard } from "./StatsCard";
import { Car, Users, FileText, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { DashboardStats as DashboardStatsType } from "@/types/agreement.types";

export const DashboardStats = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_dashboard_stats');
      if (error) throw error;
      
      // Parse the JSON response and ensure all number fields are numbers
      const parsedData = {
        total_vehicles: Number(data.total_vehicles || 0),
        available_vehicles: Number(data.available_vehicles || 0),
        rented_vehicles: Number(data.rented_vehicles || 0),
        maintenance_vehicles: Number(data.maintenance_vehicles || 0),
        total_customers: Number(data.total_customers || 0),
        active_rentals: Number(data.active_rentals || 0),
        monthly_revenue: Number(data.monthly_revenue || 0)
      };
      
      return parsedData;
    }
  });

  if (isLoading) {
    return <div>Loading stats...</div>;
  }

  const defaultStats = {
    total_vehicles: 0,
    available_vehicles: 0,
    rented_vehicles: 0,
    maintenance_vehicles: 0,
    total_customers: 0,
    active_rentals: 0,
    monthly_revenue: 0
  };

  const currentStats = stats || defaultStats;

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <StatsCard
        title="Total Vehicles"
        value={currentStats.total_vehicles.toString()}
        icon={Car}
        description={`${currentStats.available_vehicles} available`}
      />
      <StatsCard
        title="Active Rentals"
        value={currentStats.active_rentals.toString()}
        icon={FileText}
        description={`${currentStats.total_customers} total customers`}
      />
      <StatsCard
        title="Monthly Revenue"
        value={formatCurrency(currentStats.monthly_revenue)}
        icon={DollarSign}
        description={`${currentStats.rented_vehicles} rented vehicles`}
      />
    </div>
  );
};

export default DashboardStats;
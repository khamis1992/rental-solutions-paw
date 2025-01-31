import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { DashboardAlerts } from "@/components/dashboard/DashboardAlerts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardStatsData {
  total_vehicles: number;
  available_vehicles: number;
  rented_vehicles: number;
  maintenance_vehicles: number;
  total_customers: number;
  active_rentals: number;
  monthly_revenue: number;
}

export default function Dashboard() {
  const { data: statsData, isLoading } = useQuery<DashboardStatsData>({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_dashboard_stats');
      if (error) throw error;
      return data as DashboardStatsData;
    }
  });

  if (isLoading) {
    return <Skeleton className="h-[200px] w-full" />;
  }

  const stats = {
    totalVehicles: statsData?.total_vehicles || 0,
    availableVehicles: statsData?.available_vehicles || 0,
    rentedVehicles: statsData?.rented_vehicles || 0,
    maintenanceVehicles: statsData?.maintenance_vehicles || 0,
    totalCustomers: statsData?.total_customers || 0,
    activeRentals: statsData?.active_rentals || 0,
    monthlyRevenue: statsData?.monthly_revenue || 0
  };

  return (
    <div className="space-y-6 p-6">
      <DashboardStats {...stats} />
      
      <div className="grid gap-6 md:grid-cols-2">
        <div className="col-span-1">
          <DashboardAlerts />
        </div>
        {/* Add other dashboard components here */}
      </div>
    </div>
  );
}
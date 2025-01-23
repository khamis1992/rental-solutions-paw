import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { DashboardAlerts } from "@/components/dashboard/DashboardAlerts";
import { WelcomeHeader } from "@/components/dashboard/WelcomeHeader";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { UpcomingRentals } from "@/components/dashboard/UpcomingRentals";
import { VehicleStatusChart } from "@/components/dashboard/VehicleStatusChart";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface DashboardData {
  total_vehicles: number;
  available_vehicles: number;
  rented_vehicles: number;
  maintenance_vehicles: number;
  total_customers: number;
  active_rentals: number;
  monthly_revenue: number;
}

const Dashboard = () => {
  const { data: dashboardStats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dashboard_stats_view')
        .select('*')
        .single();

      if (error) throw error;
      return data as DashboardData;
    },
  });

  const stats = {
    totalVehicles: dashboardStats?.total_vehicles || 0,
    availableVehicles: dashboardStats?.available_vehicles || 0,
    rentedVehicles: dashboardStats?.rented_vehicles || 0,
    maintenanceVehicles: dashboardStats?.maintenance_vehicles || 0,
    totalCustomers: dashboardStats?.total_customers || 0,
    activeRentals: dashboardStats?.active_rentals || 0,
    monthlyRevenue: dashboardStats?.monthly_revenue || 0,
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto space-y-6 p-6">
        <WelcomeHeader />
        <DashboardStats stats={stats} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DashboardAlerts />
          <VehicleStatusChart />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <RecentActivity />
          <UpcomingRentals />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
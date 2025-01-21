import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { DashboardAlerts } from "@/components/dashboard/DashboardAlerts";
import { WelcomeHeader } from "@/components/dashboard/WelcomeHeader";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface DashboardStats {
  total_vehicles: number;
  available_vehicles: number;
  rented_vehicles: number;
  maintenance_vehicles: number;
  total_customers: number;
  active_rentals: number;
  monthly_revenue: number;
}

const Dashboard = () => {
  const { data: statsData } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke<DashboardStats>("get_dashboard_stats");
      if (error) throw error;
      return data;
    },
  });

  const stats = {
    totalVehicles: statsData?.total_vehicles ?? 0,
    availableVehicles: statsData?.available_vehicles ?? 0,
    rentedVehicles: statsData?.rented_vehicles ?? 0,
    maintenanceVehicles: statsData?.maintenance_vehicles ?? 0,
    totalCustomers: statsData?.total_customers ?? 0,
    activeRentals: statsData?.active_rentals ?? 0,
    monthlyRevenue: statsData?.monthly_revenue ?? 0,
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto space-y-6 px-4 py-8">
        <WelcomeHeader />
        <div className="grid gap-6">
          <DashboardStats stats={stats} />
          <DashboardAlerts />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
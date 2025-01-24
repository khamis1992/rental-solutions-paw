import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WelcomeHeader } from "@/components/dashboard/WelcomeHeader";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { DashboardAlerts } from "@/components/dashboard/DashboardAlerts";
import { RecentActivity } from "@/components/dashboard/RecentActivity";

const Dashboard = () => {
  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_dashboard_stats");
      
      if (error) throw error;
      
      const {
        total_vehicles,
        available_vehicles,
        rented_vehicles,
        maintenance_vehicles,
        total_customers,
        active_rentals,
        monthly_revenue
      } = data;

      return {
        totalVehicles: total_vehicles,
        availableVehicles: available_vehicles,
        rentedVehicles: rented_vehicles,
        maintenanceVehicles: maintenance_vehicles,
        totalCustomers: total_customers,
        activeRentals: active_rentals,
        monthlyRevenue: monthly_revenue
      };
    },
    staleTime: 30000,
  });

  return (
    <div className="pt-[calc(var(--header-height,56px)+2rem)] max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      <div className="flex justify-between items-center bg-secondary rounded-lg p-6 text-white">
        <div>
          <WelcomeHeader />
        </div>
      </div>

      <div className="grid gap-8">
        <DashboardStats stats={stats} />
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="col-span-2">
          <RecentActivity />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
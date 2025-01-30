import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { WelcomeHeader } from "@/components/dashboard/WelcomeHeader";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const { data: statsData } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_dashboard_stats');
      if (error) throw error;
      return data;
    }
  });

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <WelcomeHeader />
        <DashboardStats 
          totalVehicles={statsData?.total_vehicles || 0}
          availableVehicles={statsData?.available_vehicles || 0}
          rentedVehicles={statsData?.rented_vehicles || 0}
          maintenanceVehicles={statsData?.maintenance_vehicles || 0}
          totalCustomers={statsData?.total_customers || 0}
          activeRentals={statsData?.active_rentals || 0}
          monthlyRevenue={statsData?.monthly_revenue || 0}
        />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;

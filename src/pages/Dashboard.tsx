import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { supabase } from "@/integrations/supabase/client";
import type { DashboardStats as DashboardStatsType } from "@/types/agreement.types";

const Dashboard = () => {
  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_dashboard_stats');
      
      if (error) throw error;
      
      return data as DashboardStatsType;
    }
  });

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8">
        <DashboardStats 
          totalVehicles={stats?.total_vehicles || 0}
          availableVehicles={stats?.available_vehicles || 0}
          rentedVehicles={stats?.rented_vehicles || 0}
          maintenanceVehicles={stats?.maintenance_vehicles || 0}
          totalCustomers={stats?.total_customers || 0}
          activeRentals={stats?.active_rentals || 0}
          monthlyRevenue={stats?.monthly_revenue || 0}
        />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { DashboardAlerts } from "@/components/dashboard/DashboardAlerts";
import { WelcomeHeader } from "@/components/dashboard/WelcomeHeader";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { DashboardData } from "@/types/agreement.types";

const Dashboard = () => {
  const { data: dashboardData } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_dashboard_stats');
      
      if (error) {
        throw error;
      }

      // Type assertion after validating the shape
      const typedData = data as DashboardData;
      
      // Validate required properties
      if (
        typeof typedData.total_vehicles !== 'number' ||
        typeof typedData.available_vehicles !== 'number' ||
        typeof typedData.rented_vehicles !== 'number' ||
        typeof typedData.maintenance_vehicles !== 'number' ||
        typeof typedData.total_customers !== 'number' ||
        typeof typedData.active_rentals !== 'number' ||
        typeof typedData.monthly_revenue !== 'number'
      ) {
        throw new Error('Invalid dashboard data format');
      }

      return typedData;
    }
  });

  return (
    <DashboardLayout>
      <div className="container mx-auto space-y-6 px-4 py-8">
        <WelcomeHeader />
        <DashboardStats data={dashboardData} />
        <DashboardAlerts />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WelcomeHeader } from "@/components/dashboard/WelcomeHeader";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { DashboardAlerts } from "@/components/dashboard/DashboardAlerts";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { PredictiveAnalytics } from "@/components/dashboard/PredictiveAnalytics";
import { DashboardStats as DashboardStatsType } from "@/types/dashboard.types";

const Dashboard = () => {
  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_dashboard_stats");
      
      if (error) throw error;
      
      return data as DashboardStatsType;
    },
    staleTime: 30000,
  });

  const defaultStats: DashboardStatsType = {
    total_vehicles: 0,
    available_vehicles: 0,
    rented_vehicles: 0,
    maintenance_vehicles: 0,
    total_customers: 0,
    active_rentals: 0,
    monthly_revenue: 0
  };

  return (
    <div className="pt-[calc(var(--header-height,56px)+2rem)] max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      <div className="flex justify-between items-center bg-secondary rounded-lg p-6 text-white">
        <WelcomeHeader />
      </div>

      <div className="grid gap-8">
        <DashboardStats stats={stats || defaultStats} />
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="col-span-2">
          <PredictiveAnalytics />
        </div>
        <div className="col-span-2">
          <RecentActivity />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
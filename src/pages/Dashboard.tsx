
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
      
      const typedData = data as DashboardStatsType;
      
      return {
        totalVehicles: typedData.total_vehicles,
        availableVehicles: typedData.available_vehicles,
        rentedVehicles: typedData.rented_vehicles,
        maintenanceVehicles: typedData.maintenance_vehicles,
        totalCustomers: typedData.total_customers,
        activeRentals: typedData.active_rentals,
        monthlyRevenue: typedData.monthly_revenue
      };
    },
    staleTime: 30000,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="pt-[calc(var(--header-height,56px)+2rem)] max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Welcome Section with Gradient Background */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent backdrop-blur-sm border border-white/10 p-6">
          <div className="relative z-10">
            <WelcomeHeader />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 mix-blend-overlay" />
        </div>

        {/* Stats Grid with Enhanced Visual Design */}
        <div className="grid gap-8 animate-fade-in">
          <DashboardStats stats={stats || {
            totalVehicles: 0,
            availableVehicles: 0,
            rentedVehicles: 0,
            maintenanceVehicles: 0,
            totalCustomers: 0,
            activeRentals: 0,
            monthlyRevenue: 0
          }} />
        </div>

        {/* Analytics and Activity Section */}
        <div className="grid gap-8 md:grid-cols-2">
          {/* Predictive Analytics Card */}
          <div className="col-span-2 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <PredictiveAnalytics />
          </div>
          
          {/* Recent Activity Feed */}
          <div className="md:col-span-2 lg:col-span-1 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <RecentActivity />
          </div>
          
          {/* Alerts and Notifications */}
          <div className="md:col-span-2 lg:col-span-1 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <DashboardAlerts />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

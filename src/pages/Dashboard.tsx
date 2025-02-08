
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WelcomeHeader } from "@/components/dashboard/WelcomeHeader";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { DashboardStats as DashboardStatsType } from "@/types/dashboard.types";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = () => {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_dashboard_stats");
      
      if (error) throw error;
      
      return {
        totalVehicles: data.total_vehicles || 0,
        availableVehicles: data.available_vehicles || 0,
        rentedVehicles: data.rented_vehicles || 0,
        maintenanceVehicles: data.maintenance_vehicles || 0,
        totalCustomers: data.total_customers || 0,
        activeRentals: data.active_rentals || 0,
        monthlyRevenue: data.monthly_revenue || 0
      } as DashboardStatsType;
    },
  });

  if (error) {
    console.error('Error fetching dashboard stats:', error);
    return <div>Error loading dashboard</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="pt-[calc(var(--header-height,56px)+2rem)] max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Welcome Section with Enhanced Gradient Background */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent backdrop-blur-sm border border-white/10 p-8">
          <div className="relative z-10">
            <div className="absolute top-4 right-4">
              <Sparkles className="h-6 w-6 text-primary/60 animate-pulse" />
            </div>
            <WelcomeHeader />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 mix-blend-overlay" />
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-secondary/20 blur-3xl rounded-full transform translate-x-16 translate-y-16" />
        </div>

        {/* Stats Grid with Loading State */}
        <div className="grid gap-8 animate-fade-in">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          ) : (
            <DashboardStats stats={stats || {
              totalVehicles: 0,
              availableVehicles: 0,
              rentedVehicles: 0,
              maintenanceVehicles: 0,
              totalCustomers: 0,
              activeRentals: 0,
              monthlyRevenue: 0
            }} />
          )}
        </div>

        {/* Recent Activity Feed with Enhanced Card Design */}
        <div className="group bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowUpRight className="h-5 w-5 text-primary/60" />
          </div>
          <RecentActivity />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

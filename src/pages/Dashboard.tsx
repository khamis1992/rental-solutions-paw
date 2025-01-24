import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WelcomeHeader } from "@/components/dashboard/WelcomeHeader";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { DashboardAlerts } from "@/components/dashboard/DashboardAlerts";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { SystemChatbot } from "@/components/chat/SystemChatbot";

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
  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicles')
        .select(`
          total_vehicles:count(*),
          available_vehicles:count(*).filter(status.eq('available')),
          rented_vehicles:count(*).filter(status.eq('rented')),
          maintenance_vehicles:count(*).filter(status.eq('maintenance'))
        `);
      
      if (error) throw error;

      const { data: customerData } = await supabase
        .from('profiles')
        .select('count(*)', { count: 'exact' });

      const { data: activeRentals } = await supabase
        .from('leases')
        .select('count(*)', { count: 'exact' })
        .eq('status', 'active');

      const { data: revenue } = await supabase
        .from('unified_payments')
        .select('sum(amount)')
        .gte('created_at', new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString());

      return {
        ...data?.[0],
        total_customers: customerData?.count || 0,
        active_rentals: activeRentals?.count || 0,
        monthly_revenue: revenue?.[0]?.sum || 0
      } as DashboardStats;
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

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <RecentActivity />
        </div>
        <div className="lg:col-span-3">
          <SystemChatbot />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
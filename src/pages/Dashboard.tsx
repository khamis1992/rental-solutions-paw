import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardStats } from "@/types/agreement.types";
import { DashboardAlerts } from "@/components/dashboard/DashboardAlerts";
import { DashboardStats as DashboardStatsComponent } from "@/components/dashboard/DashboardStats";
import { MaintenanceTimeline } from "@/components/dashboard/MaintenanceTimeline";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { UpcomingRentals } from "@/components/dashboard/UpcomingRentals";
import { VehicleStatusChart } from "@/components/dashboard/VehicleStatusChart";
import { WelcomeHeader } from "@/components/dashboard/WelcomeHeader";

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const { data: vehicles } = await supabase
        .from('vehicles')
        .select('status', { count: 'exact' });

      const { data: customers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .eq('role', 'customer');

      const { data: activeRentals } = await supabase
        .from('leases')
        .select('*', { count: 'exact' })
        .eq('status', 'active');

      const { data: payments } = await supabase
        .from('unified_payments')
        .select('amount')
        .gte('payment_date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
        .eq('status', 'completed');

      const monthlyRevenue = payments?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;

      return {
        totalVehicles: vehicles?.length || 0,
        availableVehicles: vehicles?.filter(v => v.status === 'available').length || 0,
        rentedVehicles: vehicles?.filter(v => v.status === 'rented').length || 0,
        maintenanceVehicles: vehicles?.filter(v => v.status === 'maintenance').length || 0,
        totalCustomers: customers?.length || 0,
        activeRentals: activeRentals?.length || 0,
        monthlyRevenue
      } as DashboardStats;
    }
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <WelcomeHeader />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardStatsComponent stats={stats!} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <VehicleStatusChart />
        <DashboardAlerts />
        <UpcomingRentals />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <MaintenanceTimeline />
        <RecentActivity />
      </div>
    </div>
  );
}
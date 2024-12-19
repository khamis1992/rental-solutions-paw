import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { UpcomingRentals } from "@/components/dashboard/UpcomingRentals";
import { DashboardAlerts } from "@/components/dashboard/DashboardAlerts";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { WelcomeHeader } from "@/components/dashboard/WelcomeHeader";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const Index = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Set up real-time subscriptions for dashboard data
    const channels = [
      // Vehicle status changes
      supabase
        .channel('vehicle-status-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'vehicles' },
          async () => {
            console.log('Vehicle status changed, refreshing stats...');
            await queryClient.invalidateQueries({ queryKey: ['vehicle-status-counts'] });
          }
        )
        .subscribe(),

      // Rental updates
      supabase
        .channel('rental-updates')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'leases' },
          async () => {
            console.log('Rental status changed, refreshing upcoming rentals...');
            await queryClient.invalidateQueries({ queryKey: ['upcoming-rentals'] });
          }
        )
        .subscribe(),

      // Alert updates
      supabase
        .channel('alert-updates')
        .on(
          'postgres_changes',
          { 
            event: '*', 
            schema: 'public', 
            table: 'maintenance',
            filter: "status=in.(scheduled,in_progress)" 
          },
          async () => {
            console.log('Maintenance alert changed, refreshing alerts...');
            await queryClient.invalidateQueries({ queryKey: ['dashboard-alerts'] });
          }
        )
        .subscribe()
    ];

    // Error handling for real-time subscriptions
    channels.forEach(channel => {
      channel.on('error', (error) => {
        console.error('Realtime subscription error:', error);
        toast.error('Error in real-time updates. Trying to reconnect...');
      });
    });

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [queryClient]);

  return (
    <DashboardLayout>
      {/* Welcome Section */}
      <WelcomeHeader />
      
      {/* KPI Cards */}
      <DashboardStats />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 mb-6">
        {/* Upcoming Rentals - Spans 4 columns */}
        <UpcomingRentals />

        {/* Alerts & Notifications - Spans 3 columns */}
        <DashboardAlerts />
      </div>

      {/* Recent Activity and Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Activity - Spans 4 columns */}
        <RecentActivity />

        {/* Quick Actions Section */}
        <QuickActions />
      </div>
    </DashboardLayout>
  );
};

export default Index;
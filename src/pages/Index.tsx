import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { UpcomingRentals } from "@/components/dashboard/UpcomingRentals";
import { DashboardAlerts } from "@/components/dashboard/DashboardAlerts";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { WelcomeHeader } from "@/components/dashboard/WelcomeHeader";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { performanceMetrics } from "@/services/performanceMonitoring";

const Index = () => {
  const queryClient = useQueryClient();
  const cpuMonitoringInterval = useRef<NodeJS.Timeout>();

  const monitorCPU = async () => {
    try {
      const cpuUsage = await measureCPUUsage();
      await performanceMetrics.trackCPUUtilization(cpuUsage);
      
      if (cpuUsage > 80) {
        toast.warning("High CPU Usage", {
          description: `Current CPU utilization is ${cpuUsage.toFixed(1)}%`
        });
      }
    } catch (error) {
      console.error('Failed to monitor CPU:', error);
    }
  };

  const measureCPUUsage = async (): Promise<number> => {
    if (!window.performance || !window.performance.memory) {
      return 0;
    }

    const startTime = performance.now();
    const startUsage = performance.memory?.usedJSHeapSize || 0;
    
    // Simulate some work to measure CPU usage
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const endTime = performance.now();
    const endUsage = performance.memory?.usedJSHeapSize || 0;
    
    // Calculate a rough CPU usage estimation
    const duration = endTime - startTime;
    const memoryDiff = endUsage - startUsage;
    const cpuUsage = (memoryDiff / duration) * 100;
    
    // Normalize to a 0-100 range
    return Math.min(Math.max(cpuUsage, 0), 100);
  };

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
            await queryClient.invalidateQueries({
              queryKey: ['vehicle-status-counts'],
              type: 'all',
              exact: true
            });
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
            await queryClient.invalidateQueries({
              queryKey: ['upcoming-rentals'],
              type: 'all',
              exact: true
            });
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
            await queryClient.invalidateQueries({
              queryKey: ['dashboard-alerts'],
              type: 'all',
              exact: true
            });
          }
        )
        .subscribe()
    ];

    // Start CPU monitoring
    cpuMonitoringInterval.current = setInterval(monitorCPU, 5000);

    // Error handling for real-time subscriptions
    channels.forEach(channel => {
      channel.on('error', (error) => {
        console.error('Realtime subscription error:', error);
        toast.error('Error in real-time updates. Trying to reconnect...');
      });
    });

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
      if (cpuMonitoringInterval.current) {
        clearInterval(cpuMonitoringInterval.current);
      }
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
        <div className="lg:col-span-4">
          <UpcomingRentals />
        </div>

        {/* Alerts & Notifications - Spans 3 columns */}
        <div className="lg:col-span-3">
          <DashboardAlerts />
        </div>
      </div>

      {/* Recent Activity and Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Activity - Spans 4 columns */}
        <div className="lg:col-span-4">
          <RecentActivity />
        </div>

        {/* Quick Actions Section */}
        <div className="lg:col-span-3">
          <QuickActions />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
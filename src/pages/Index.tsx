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

interface MemoryInfo {
  jsHeapSizeLimit: number;
  totalJSHeapSize: number;
  usedJSHeapSize: number;
}

interface ExtendedPerformance extends Performance {
  memory?: MemoryInfo;
}

// Configuration constants for resource monitoring
const MONITORING_INTERVALS = {
  CPU: 5000,    // 5 seconds
  MEMORY: 5000, // 5 seconds
  DISK: 60000   // 1 minute
};

const RESOURCE_THRESHOLDS = {
  CPU: 80,    // 80%
  MEMORY: 80, // 80%
  DISK: 90    // 90%
};

const Index = () => {
  const queryClient = useQueryClient();
  const cpuMonitoringInterval = useRef<NodeJS.Timeout>();
  const memoryMonitoringInterval = useRef<NodeJS.Timeout>();
  const diskMonitoringInterval = useRef<NodeJS.Timeout>();

  const monitorCPU = async () => {
    try {
      const cpuUsage = await measureCPUUsage();
      await performanceMetrics.trackCPUUtilization(cpuUsage);
    } catch (error) {
      console.error('Failed to monitor CPU:', error);
    }
  };

  const monitorMemory = async () => {
    try {
      await performanceMetrics.trackMemoryUsage();
    } catch (error) {
      console.error('Failed to monitor memory:', error);
    }
  };

  const monitorDiskIO = async () => {
    try {
      await performanceMetrics.trackDiskIO();
    } catch (error) {
      console.error('Failed to monitor disk I/O:', error);
    }
  };

  const measureCPUUsage = async (): Promise<number> => {
    const performance = window.performance as ExtendedPerformance;
    if (!performance || !performance.memory) {
      return 0;
    }

    const startTime = performance.now();
    const startUsage = performance.memory.usedJSHeapSize;
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const endTime = performance.now();
    const endUsage = performance.memory.usedJSHeapSize;
    
    const duration = endTime - startTime;
    const memoryDiff = endUsage - startUsage;
    const cpuUsage = (memoryDiff / duration) * 100;
    
    return Math.min(Math.max(cpuUsage, 0), 100);
  };

  useEffect(() => {
    // Set up real-time subscriptions for dashboard data with optimized channels
    const channels = [
      supabase
        .channel('vehicle-status-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'vehicles' },
          async () => {
            console.log('Vehicle status changed, refreshing stats...');
            await queryClient.invalidateQueries({
              queryKey: ['vehicle-status-counts'],
              exact: true,
              type: 'all',
              refetchType: 'active'
            });
          }
        )
        .subscribe(),

      supabase
        .channel('rental-updates')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'leases' },
          async () => {
            console.log('Rental status changed, refreshing upcoming rentals...');
            await queryClient.invalidateQueries({
              queryKey: ['upcoming-rentals'],
              exact: true,
              type: 'all',
              refetchType: 'active'
            });
          }
        )
        .subscribe(),

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
              exact: true,
              type: 'all',
              refetchType: 'active'
            });
          }
        )
        .subscribe()
    ];

    // Start performance monitoring with optimized intervals
    cpuMonitoringInterval.current = setInterval(monitorCPU, MONITORING_INTERVALS.CPU);
    memoryMonitoringInterval.current = setInterval(monitorMemory, MONITORING_INTERVALS.MEMORY);
    diskMonitoringInterval.current = setInterval(monitorDiskIO, MONITORING_INTERVALS.DISK);

    // Error handling for real-time subscriptions
    channels.forEach(channel => {
      channel.on('error', (error) => {
        console.error('Realtime subscription error:', error);
        toast.error('Error in real-time updates. Trying to reconnect...', {
          duration: 5000,
        });
      });
    });

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
      if (cpuMonitoringInterval.current) {
        clearInterval(cpuMonitoringInterval.current);
      }
      if (memoryMonitoringInterval.current) {
        clearInterval(memoryMonitoringInterval.current);
      }
      if (diskMonitoringInterval.current) {
        clearInterval(diskMonitoringInterval.current);
      }
    };
  }, [queryClient]);

  return (
    <DashboardLayout>
      <WelcomeHeader />
      <DashboardStats />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 mb-6">
        <div className="lg:col-span-4">
          <UpcomingRentals />
        </div>
        <div className="lg:col-span-3">
          <DashboardAlerts />
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <RecentActivity />
        </div>
        <div className="lg:col-span-3">
          <QuickActions />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
import { useEffect } from "react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { UpcomingRentals } from "@/components/dashboard/UpcomingRentals";
import { VehicleStatusChart } from "@/components/dashboard/VehicleStatusChart";
import { WelcomeHeader } from "@/components/dashboard/WelcomeHeader";
import { DashboardAlerts } from "@/components/dashboard/DashboardAlerts";
import { performanceMetrics } from "@/services/performanceMonitoring";

export default function Index() {
  useEffect(() => {
    // Start CPU monitoring when dashboard loads
    const stopMonitoring = performanceMetrics.startCPUMonitoring();
    
    // Cleanup when component unmounts
    return () => stopMonitoring();
  }, []);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <DashboardHeader />
      <WelcomeHeader />
      <DashboardAlerts />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardStats />
      </div>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
        <VehicleStatusChart />
        <QuickActions />
      </div>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <UpcomingRentals />
        <RecentActivity />
      </div>
    </div>
  );
}
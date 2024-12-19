import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { UpcomingRentals } from "@/components/dashboard/UpcomingRentals";
import { DashboardAlerts } from "@/components/dashboard/DashboardAlerts";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { WelcomeHeader } from "@/components/dashboard/WelcomeHeader";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { AiAnalyticsInsights } from "@/components/analytics/AiAnalyticsInsights";
import { IntelligentScheduling } from "@/components/dashboard/IntelligentScheduling";
import { usePerformanceMonitoring } from "@/hooks/use-performance-monitoring";
import { useDashboardSubscriptions } from "@/hooks/use-dashboard-subscriptions";

const Index = () => {
  // Initialize performance monitoring
  usePerformanceMonitoring();
  
  // Initialize real-time subscriptions
  useDashboardSubscriptions();

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom duration-1000">
        <WelcomeHeader />
        
        <div className="grid gap-6">
          <DashboardStats />
        </div>

        <div className="grid gap-6 lg:grid-cols-7">
          <div className="lg:col-span-4 space-y-6">
            <UpcomingRentals />
            <RecentActivity />
          </div>
          
          <div className="lg:col-span-3 space-y-6">
            <DashboardAlerts />
            <QuickActions />
            <IntelligentScheduling />
          </div>
        </div>

        <div className="rounded-lg border bg-card">
          <AiAnalyticsInsights />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
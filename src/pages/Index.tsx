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
  usePerformanceMonitoring();
  useDashboardSubscriptions();

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom duration-1000">
        <WelcomeHeader />
        
        <div className="grid gap-6">
          <DashboardStats />
        </div>

        <div className="grid gap-6 lg:grid-cols-7">
          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-xl border bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
              <UpcomingRentals />
            </div>
            <div className="rounded-xl border bg-gradient-to-br from-orange-50 to-rose-50 p-6">
              <RecentActivity />
            </div>
          </div>
          
          <div className="lg:col-span-3 space-y-6">
            <div className="rounded-xl border bg-gradient-to-br from-purple-50 to-pink-50 p-6">
              <DashboardAlerts />
            </div>
            <div className="rounded-xl border bg-gradient-to-br from-emerald-50 to-teal-50 p-6">
              <QuickActions />
            </div>
            <div className="rounded-xl border bg-gradient-to-br from-yellow-50 to-amber-50 p-6">
              <IntelligentScheduling />
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-gradient-to-br from-cyan-50 to-sky-50 p-6">
          <AiAnalyticsInsights />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
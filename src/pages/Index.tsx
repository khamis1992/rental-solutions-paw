import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { UpcomingRentals } from "@/components/dashboard/UpcomingRentals";
import { DashboardAlerts } from "@/components/dashboard/DashboardAlerts";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { WelcomeHeader } from "@/components/dashboard/WelcomeHeader";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { usePerformanceMonitoring } from "@/hooks/use-performance-monitoring";
import { useDashboardSubscriptions } from "@/hooks/use-dashboard-subscriptions";
import { SystemChatbot } from "@/components/chat/SystemChatbot";

const Index = () => {
  usePerformanceMonitoring();
  useDashboardSubscriptions();

  return (
    <DashboardLayout>
      <div className="container mx-auto space-y-6 px-4 py-6 md:space-y-8 md:px-6 md:py-8">
        <WelcomeHeader />
        <DashboardStats />
        <QuickActions />
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 lg:gap-8">
          <div className="lg:col-span-4">
            <UpcomingRentals />
          </div>
          <div className="lg:col-span-3">
            <DashboardAlerts />
          </div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 lg:gap-8">
          <div className="lg:col-span-4">
            <RecentActivity />
          </div>
          <div className="lg:col-span-3">
            <SystemChatbot />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
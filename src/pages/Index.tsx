import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { UpcomingRentals } from "@/components/dashboard/UpcomingRentals";
import { DashboardAlerts } from "@/components/dashboard/DashboardAlerts";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { WelcomeHeader } from "@/components/dashboard/WelcomeHeader";
import { RecentActivity } from "@/components/dashboard/RecentActivity";

const Index = () => {
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
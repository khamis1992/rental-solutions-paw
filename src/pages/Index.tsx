import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { DashboardAlerts } from "@/components/dashboard/DashboardAlerts";
import { WelcomeHeader } from "@/components/dashboard/WelcomeHeader";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { CustomerSegmentation } from "@/components/analytics/CustomerSegmentation";

const Index = () => {
  return (
    <DashboardLayout>
      <WelcomeHeader />
      <DashboardStats />
      <div className="grid gap-6 md:grid-cols-2 mt-6">
        <QuickActions />
        <RecentActivity />
      </div>
      <div className="mt-6">
        <CustomerSegmentation />
      </div>
      <div className="mt-6">
        <DashboardAlerts />
      </div>
    </DashboardLayout>
  );
};

export default Index;
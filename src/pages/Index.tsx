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
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <WelcomeHeader />
        </div>

        {/* Stats Section */}
        <section className="mb-8">
          <DashboardStats />
        </section>

        {/* Quick Actions and Recent Activity */}
        <section className="grid gap-6 md:grid-cols-2 mb-8">
          <div className="bg-white rounded-lg shadow-sm">
            <QuickActions />
          </div>
          <div className="bg-white rounded-lg shadow-sm">
            <RecentActivity />
          </div>
        </section>

        {/* Customer Segmentation */}
        <section className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <CustomerSegmentation />
        </section>

        {/* Alerts Section */}
        <section className="bg-white rounded-lg shadow-sm p-6">
          <DashboardAlerts />
        </section>
      </div>
    </DashboardLayout>
  );
};

export default Index;
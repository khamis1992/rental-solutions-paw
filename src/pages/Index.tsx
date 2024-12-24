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
      <div className="min-h-screen bg-gray-50">
        {/* Welcome Section with enhanced styling */}
        <div className="container mx-auto px-6 py-8">
          <div className="mb-8">
            <WelcomeHeader />
          </div>

          {/* Stats Grid with larger cards and better spacing */}
          <section className="mb-10">
            <DashboardStats />
          </section>

          {/* Quick Actions and Recent Activity in a grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
            <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <h2 className="text-xl font-semibold mb-6 text-gray-800">Quick Actions</h2>
              <QuickActions />
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <h2 className="text-xl font-semibold mb-6 text-gray-800">Recent Activity</h2>
              <RecentActivity />
            </div>
          </div>

          {/* Customer Segmentation with enhanced visuals */}
          <section className="mb-10">
            <div className="bg-white rounded-lg shadow-sm p-8 hover:shadow-md transition-shadow">
              <h2 className="text-xl font-semibold mb-6 text-gray-800">Customer Insights</h2>
              <CustomerSegmentation />
            </div>
          </section>

          {/* Alerts Section with improved styling */}
          <section className="mb-8">
            <div className="bg-white rounded-lg shadow-sm p-8 hover:shadow-md transition-shadow">
              <h2 className="text-xl font-semibold mb-6 text-gray-800">Important Alerts</h2>
              <DashboardAlerts />
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
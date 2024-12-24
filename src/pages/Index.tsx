import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { WelcomeHeader } from "@/components/dashboard/WelcomeHeader";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { UpcomingRentals } from "@/components/dashboard/UpcomingRentals";
import { IntelligentScheduling } from "@/components/dashboard/IntelligentScheduling";
import { CustomerSegmentation } from "@/components/analytics/CustomerSegmentation";

const Index = () => {
  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50/50">
        <div className="container mx-auto px-4 py-8">
          {/* Welcome Section with improved spacing */}
          <div className="mb-8">
            <WelcomeHeader />
          </div>

          {/* Quick Actions with larger, more prominent buttons */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Quick Actions</h2>
            <QuickActions />
          </div>

          {/* Main Stats Grid with enhanced visuals */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Key Metrics</h2>
            <DashboardStats />
          </div>

          {/* Three Column Layout for Additional Widgets */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
            {/* Left Column - Upcoming Rentals */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-6 text-gray-800">Upcoming Rentals</h2>
                <UpcomingRentals />
              </div>
            </div>

            {/* Middle Column - Intelligent Scheduling */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-6 text-gray-800">Schedule Overview</h2>
                <IntelligentScheduling />
              </div>
            </div>

            {/* Right Column - Recent Activity */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-6 text-gray-800">Recent Activity</h2>
                <RecentActivity />
              </div>
            </div>
          </div>

          {/* Customer Insights Section */}
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-xl font-semibold mb-6 text-gray-800">Customer Insights</h2>
              <CustomerSegmentation />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
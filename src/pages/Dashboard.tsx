import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { DashboardAlerts } from "@/components/dashboard/DashboardAlerts";
import { VehicleStatusChart } from "@/components/dashboard/VehicleStatusChart";
import { UpcomingRentals } from "@/components/dashboard/UpcomingRentals";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { IntelligentScheduling } from "@/components/dashboard/IntelligentScheduling";

const Dashboard = () => {
  return (
    <DashboardLayout>
      <div className="w-full bg-background">
        <div className="pt-[calc(var(--header-height,56px)+2rem)] max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="space-y-6">
            <DashboardStats />
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
              <DashboardAlerts />
              <VehicleStatusChart />
            </div>
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
              <UpcomingRentals />
              <RecentActivity />
            </div>
            <IntelligentScheduling />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
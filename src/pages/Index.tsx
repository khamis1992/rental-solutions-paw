import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { DashboardAlerts } from "@/components/dashboard/DashboardAlerts";
import { WelcomeHeader } from "@/components/dashboard/WelcomeHeader";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { UpcomingRentals } from "@/components/dashboard/UpcomingRentals";
import { VehicleStatusChart } from "@/components/dashboard/VehicleStatusChart";

export default function Index() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 p-6">
        <WelcomeHeader />
        <DashboardStats />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DashboardAlerts />
          <QuickActions />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <RecentActivity />
          <UpcomingRentals />
        </div>
        <VehicleStatusChart />
      </div>
    </DashboardLayout>
  );
}
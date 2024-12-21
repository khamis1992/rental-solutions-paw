import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { WelcomeHeader } from "@/components/dashboard/WelcomeHeader";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { VehicleStatusChart } from "@/components/dashboard/VehicleStatusChart";
import { UpcomingRentals } from "@/components/dashboard/UpcomingRentals";
import { RecentActivity } from "@/components/dashboard/RecentActivity";

const Index = () => {
  return (
    <DashboardLayout>
      <div className="container mx-auto space-y-6 p-2 md:p-4">
        <WelcomeHeader />
        <DashboardStats />
        <QuickActions />
        <div className="grid gap-6 lg:grid-cols-8">
          <VehicleStatusChart />
          <div className="grid gap-6 lg:col-span-4">
            <UpcomingRentals />
            <RecentActivity />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
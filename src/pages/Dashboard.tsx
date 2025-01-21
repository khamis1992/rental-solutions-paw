import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { DashboardAlerts } from "@/components/dashboard/DashboardAlerts";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { WelcomeHeader } from "@/components/dashboard/WelcomeHeader";
import { VehicleStatusChart } from "@/components/dashboard/VehicleStatusChart";

export default function Dashboard() {
  return (
    <div className="w-full bg-background">
      <div className="pt-[calc(var(--header-height,56px)+2rem)] max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        <WelcomeHeader />
        <DashboardStats />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DashboardAlerts />
          <VehicleStatusChart />
        </div>
        <RecentActivity />
      </div>
    </div>
  );
}
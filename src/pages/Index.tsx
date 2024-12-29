import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { DashboardAlerts } from "@/components/dashboard/DashboardAlerts";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { UpcomingRentals } from "@/components/dashboard/UpcomingRentals";
import { WelcomeHeader } from "@/components/dashboard/WelcomeHeader";

export default function Index() {
  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <WelcomeHeader />
      
      <div className="space-y-8">
        <DashboardStats />
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-8">
          <DashboardAlerts />
          <RecentActivity />
          <UpcomingRentals />
        </div>
      </div>
    </div>
  );
}
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { DashboardAlerts } from "@/components/dashboard/DashboardAlerts";
import { WelcomeHeader } from "@/components/dashboard/WelcomeHeader";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { SystemChatbot } from "@/components/chat/SystemChatbot";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex flex-col gap-6">
          <div className="w-full mt-6">
            <WelcomeHeader />
          </div>

          <div className="w-full">
            <DashboardStats />
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <DashboardAlerts />
            <RecentActivity />
          </div>
          
          <div className="w-full">
            <SystemChatbot />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
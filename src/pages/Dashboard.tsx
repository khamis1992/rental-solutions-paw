import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { DashboardAlerts } from "@/components/dashboard/DashboardAlerts";
import { WelcomeHeader } from "@/components/dashboard/WelcomeHeader";

const Dashboard = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <WelcomeHeader />
      <DashboardStats />
      <DashboardAlerts />
    </div>
  );
};

export default Dashboard;
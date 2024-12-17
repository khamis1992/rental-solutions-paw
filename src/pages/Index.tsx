import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { UpcomingRentals } from "@/components/dashboard/UpcomingRentals";
import { DashboardAlerts } from "@/components/dashboard/DashboardAlerts";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { VehicleStatusChart } from "@/components/dashboard/VehicleStatusChart";
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Car, Clock, CheckCircle } from "lucide-react";

const Index = () => {
  return (
    <DashboardLayout>
      {/* Welcome Section */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, Admin</h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your rental fleet today.
          </p>
        </div>
      </div>
      
      {/* KPI Cards */}
      <DashboardStats />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 mb-6">
        {/* Vehicle Status Chart - Spans 3 columns */}
        <div className="lg:col-span-3">
          <VehicleStatusChart />
        </div>

        {/* Upcoming Rentals - Spans 4 columns */}
        <div className="lg:col-span-4">
          <UpcomingRentals />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Alerts & Notifications - Spans 3 columns */}
        <div className="lg:col-span-3">
          <DashboardAlerts />
        </div>

        {/* Quick Actions Section - Spans 4 columns */}
        <div className="lg:col-span-4">
          <QuickActions />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
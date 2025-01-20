import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { WelcomeHeader } from "@/components/dashboard/WelcomeHeader";
import { VehicleStatusChart } from "@/components/dashboard/VehicleStatusChart";
import { DashboardAlerts } from "@/components/dashboard/DashboardAlerts";
import { formatCurrency } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dashboard_stats")
        .select("*")
        .single();

      if (error) throw error;
      return data;
    },
  });

  return (
    <DashboardLayout>
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        <WelcomeHeader />

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Total Vehicles
            </h3>
            <div className="text-2xl font-bold">
              {stats?.totalVehicles || 0}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Active Rentals
            </h3>
            <div className="text-2xl font-bold">
              {stats?.activeRentals || 0}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Monthly Revenue
            </h3>
            <div className="text-2xl font-bold">
              {formatCurrency(stats?.monthlyRevenue || 0)}
            </div>
          </Card>
        </div>

        {/* Two Column Layout */}
        <div className="grid gap-8 lg:grid-cols-7">
          {/* Vehicle Status Chart */}
          <div className="lg:col-span-4">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">Vehicle Status</h2>
                <select className="text-sm border rounded-md px-2 py-1">
                  <option>All Vehicle Types</option>
                </select>
              </div>
              <VehicleStatusChart />
            </Card>
          </div>

          {/* Alerts & Notifications */}
          <div className="lg:col-span-3">
            <DashboardAlerts />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;

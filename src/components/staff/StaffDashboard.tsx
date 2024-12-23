import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { VehicleStatusChart } from "@/components/dashboard/VehicleStatusChart";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Car, Users, CheckCircle, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export const StaffDashboard = () => {
  const { data: dashboardStats } = useQuery({
    queryKey: ['staff-dashboard-stats'],
    queryFn: async () => {
      const { data: vehicles } = await supabase
        .from('vehicles')
        .select('status');

      const { data: rentals } = await supabase
        .from('leases')
        .select('status')
        .eq('status', 'pending_payment');

      const { data: maintenance } = await supabase
        .from('maintenance')
        .select('status')
        .eq('status', 'scheduled');

      return {
        availableVehicles: vehicles?.filter(v => v.status === 'available').length || 0,
        pendingRentals: rentals?.length || 0,
        maintenanceTasks: maintenance?.length || 0,
      };
    },
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Staff Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-4">
        <StatsCard
          title="Available Vehicles"
          value={dashboardStats?.availableVehicles.toString() || "0"}
          icon={Car}
          description="Ready for rental"
        />
        <StatsCard
          title="Pending Rentals"
          value={dashboardStats?.pendingRentals.toString() || "0"}
          icon={Users}
          description="Awaiting processing"
        />
        <StatsCard
          title="Maintenance Tasks"
          value={dashboardStats?.maintenanceTasks.toString() || "0"}
          icon={CheckCircle}
          description="Scheduled maintenance"
        />
        <StatsCard
          title="Daily Target"
          value={formatCurrency(5000)}
          icon={TrendingUp}
          description="75% achieved"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Vehicle Status Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <VehicleStatusChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentActivity />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
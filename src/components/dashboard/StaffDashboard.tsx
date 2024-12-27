import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

export const StaffDashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['staff-dashboard-stats'],
    queryFn: async () => {
      const [customersResponse, activeLeases, maintenanceResponse] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact' }).eq('role', 'customer'),
        supabase.from('leases').select('*', { count: 'exact' }).eq('status', 'active'),
        supabase.from('maintenance').select('*', { count: 'exact' }).eq('status', 'pending')
      ]);

      return {
        totalCustomers: customersResponse.count || 0,
        activeLeases: activeLeases.count || 0,
        pendingMaintenance: maintenanceResponse.count || 0
      };
    }
  });

  if (isLoading) {
    return <Skeleton className="w-full h-[200px]" />;
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.totalCustomers}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Leases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.activeLeases}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Maintenance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.pendingMaintenance}</div>
        </CardContent>
      </Card>
    </div>
  );
};
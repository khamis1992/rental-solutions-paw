import { Car, FileText, DollarSign, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { DashboardAlerts } from "@/components/dashboard/DashboardAlerts";
import { WelcomeHeader } from "@/components/dashboard/WelcomeHeader";
import { VehicleStatusChart } from "@/components/dashboard/VehicleStatusChart";
import { formatCurrency } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const [vehiclesResponse, rentalsResponse, revenueResponse] = await Promise.all([
        // Get total vehicles
        supabase
          .from('vehicles')
          .select('id', { count: 'exact' })
          .eq('is_test_data', false),
        
        // Get active rentals
        supabase
          .from('leases')
          .select('id', { count: 'exact' })
          .eq('status', 'active'),
        
        // Calculate monthly revenue
        supabase
          .from('payments')
          .select('amount')
          .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
          .eq('status', 'completed')
      ]);

      if (vehiclesResponse.error) throw vehiclesResponse.error;
      if (rentalsResponse.error) throw rentalsResponse.error;
      if (revenueResponse.error) throw revenueResponse.error;

      const monthlyRevenue = revenueResponse.data?.reduce((sum, payment) => 
        sum + (payment.amount || 0), 0) || 0;

      return {
        totalVehicles: vehiclesResponse.count || 0,
        activeRentals: rentalsResponse.count || 0,
        monthlyRevenue
      };
    },
    staleTime: 30000, // Cache for 30 seconds
  });

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
      <WelcomeHeader />
      
      {/* Stats Grid */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Vehicles
            </CardTitle>
            <Car className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">
              {stats?.totalVehicles || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">
              Fleet size
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Rentals
            </CardTitle>
            <FileText className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">
              {stats?.activeRentals || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">
              Currently rented
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Monthly Revenue
            </CardTitle>
            <DollarSign className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">
              {formatCurrency(stats?.monthlyRevenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1.5 flex items-center">
              <TrendingUp className="h-4 w-4 mr-1 text-emerald-600" />
              <span className="text-emerald-600">This month</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Vehicle Status Chart */}
      <div className="space-y-6">
        <VehicleStatusChart />
      </div>

      <DashboardAlerts />
    </div>
  );
};

export default Dashboard;
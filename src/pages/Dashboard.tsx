import { Car, FileText, DollarSign, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WelcomeHeader } from "@/components/dashboard/WelcomeHeader";
import { VehicleStatusChart } from "@/components/dashboard/VehicleStatusChart";
import { DashboardAlerts } from "@/components/dashboard/DashboardAlerts";
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
    staleTime: 30000,
  });

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex justify-between items-center bg-secondary rounded-lg p-6 text-white">
        <div>
          <WelcomeHeader />
          <p className="text-gray-300">Welcome back to your dashboard. Here's what's happening today.</p>
        </div>
        <Button variant="default" size="lg" className="bg-primary hover:bg-primary/90">
          + New Agreement
        </Button>
      </div>
      
      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <Card className="p-6 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Total Vehicles</span>
            <Car className="h-5 w-5 text-blue-500" />
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold">
              {stats?.totalVehicles || 0}
            </div>
            <p className="text-sm text-muted-foreground">
              Fleet size
            </p>
          </div>
        </Card>

        <Card className="p-6 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Active Rentals</span>
            <FileText className="h-5 w-5 text-purple-500" />
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold">
              {stats?.activeRentals || 0}
            </div>
            <p className="text-sm text-muted-foreground">
              Currently rented
            </p>
          </div>
        </Card>

        <Card className="p-6 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Monthly Revenue</span>
            <DollarSign className="h-5 w-5 text-green-500" />
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold">
              QAR {formatCurrency(stats?.monthlyRevenue || 0)}
            </div>
            <div className="flex items-center text-sm text-emerald-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>This month</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-8 grid-cols-1 lg:grid-cols-7">
        {/* Vehicle Status Chart - 4 columns */}
        <Card className="p-6 rounded-lg lg:col-span-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Vehicle Status</h2>
            <select className="text-sm border rounded-md px-2 py-1">
              <option>All Vehicle Types</option>
            </select>
          </div>
          <div className="h-[300px]">
            <VehicleStatusChart />
          </div>
        </Card>

        {/* Alerts Section - 3 columns */}
        <div className="lg:col-span-3">
          <DashboardAlerts />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
import { 
  Car, DollarSign, Users, FileText, ArrowUpRight, 
  Clock, CheckCircle, CalendarClock, CarFront, 
  BellRing, AlertTriangle
} from "lucide-react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

const Index = () => {
  const { data: upcomingRentals } = useQuery({
    queryKey: ["upcoming-rentals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leases")
        .select(`
          *,
          vehicles (make, model, year),
          profiles (full_name)
        `)
        .gte("start_date", new Date().toISOString())
        .order("start_date")
        .limit(5);

      if (error) throw error;
      return data;
    },
  });

  const { data: alerts } = useQuery({
    queryKey: ["alerts"],
    queryFn: async () => {
      const now = new Date().toISOString();
      
      // Fetch overdue vehicles
      const { data: overdueVehicles } = await supabase
        .from("leases")
        .select("*, vehicles(make, model, year), profiles(full_name)")
        .lt("end_date", now)
        .eq("status", "active")
        .limit(5);

      // Fetch overdue payments
      const { data: overduePayments } = await supabase
        .from("payment_schedules")
        .select("*, leases(*, profiles(full_name))")
        .lt("due_date", now)
        .eq("status", "pending")
        .limit(5);

      // Fetch maintenance alerts
      const { data: maintenanceAlerts } = await supabase
        .from("maintenance")
        .select("*, vehicles(make, model, year)")
        .eq("status", "scheduled")
        .lte("scheduled_date", now)
        .limit(5);

      return {
        overdueVehicles: overdueVehicles || [],
        overduePayments: overduePayments || [],
        maintenanceAlerts: maintenanceAlerts || [],
      };
    },
  });

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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatsCard
          title="Total Vehicles"
          value="124"
          icon={Car}
          description={
            <span className="flex items-center text-emerald-600">
              <ArrowUpRight className="mr-1 h-4 w-4" />
              +2 this month
            </span>
          }
        />
        <StatsCard
          title="Active Customers"
          value="1,429"
          icon={Users}
          description={
            <span className="flex items-center text-emerald-600">
              <ArrowUpRight className="mr-1 h-4 w-4" />
              +18.2% from last month
            </span>
          }
        />
        <StatsCard
          title="Active Rentals"
          value="89"
          icon={FileText}
          description={
            <span className="flex items-center text-yellow-600">
              23 pending returns
            </span>
          }
        />
        <StatsCard
          title="Monthly Revenue"
          value="$48,574"
          icon={DollarSign}
          description={
            <span className="flex items-center text-emerald-600">
              <ArrowUpRight className="mr-1 h-4 w-4" />
              +7.4% from last month
            </span>
          }
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 mb-6">
        {/* Upcoming Rentals - Spans 4 columns */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-muted-foreground" />
              Upcoming Rentals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingRentals?.map((rental) => (
                <div key={rental.id} className="flex items-center gap-4 p-4 rounded-lg border">
                  <div className="h-12 w-12 rounded-full flex items-center justify-center bg-blue-50 text-blue-500">
                    <CarFront className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium">
                      {rental.vehicles.year} {rental.vehicles.make} {rental.vehicles.model}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Reserved by {rental.profiles.full_name}
                    </p>
                  </div>
                  <Badge variant="secondary" className="whitespace-nowrap">
                    {new Date(rental.start_date).toLocaleDateString()}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alerts & Notifications - Spans 3 columns */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BellRing className="h-5 w-5 text-muted-foreground" />
              Alerts & Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts?.overdueVehicles.map((vehicle) => (
                <div key={vehicle.id} className="flex items-center gap-4 p-4 rounded-lg border border-red-200 bg-red-50">
                  <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-red-100 text-red-500">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-red-700">Overdue Vehicle</h4>
                    <p className="text-sm text-red-600">
                      {vehicle.vehicles.year} {vehicle.vehicles.make} {vehicle.vehicles.model} - 
                      {vehicle.profiles.full_name}
                    </p>
                  </div>
                </div>
              ))}

              {alerts?.overduePayments.map((payment) => (
                <div key={payment.id} className="flex items-center gap-4 p-4 rounded-lg border border-yellow-200 bg-yellow-50">
                  <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-yellow-100 text-yellow-500">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-yellow-700">Overdue Payment</h4>
                    <p className="text-sm text-yellow-600">
                      {payment.leases.profiles.full_name} - ${payment.amount}
                    </p>
                  </div>
                </div>
              ))}

              {alerts?.maintenanceAlerts.map((maintenance) => (
                <div key={maintenance.id} className="flex items-center gap-4 p-4 rounded-lg border border-blue-200 bg-blue-50">
                  <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-blue-100 text-blue-500">
                    <Car className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-blue-700">Maintenance Due</h4>
                    <p className="text-sm text-blue-600">
                      {maintenance.vehicles.year} {maintenance.vehicles.make} {maintenance.vehicles.model} - 
                      {maintenance.service_type}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity and Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Activity - Spans 4 columns */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  icon: Car,
                  title: "New Vehicle Added",
                  description: "2024 Toyota Camry - Added to fleet",
                  time: "2h ago",
                  status: "success"
                },
                {
                  icon: Clock,
                  title: "Rental Agreement Updated",
                  description: "Agreement #1234 extended by 2 days",
                  time: "3h ago",
                  status: "warning"
                },
                {
                  icon: CheckCircle,
                  title: "Vehicle Returned",
                  description: "BMW X5 returned - Inspection pending",
                  time: "5h ago",
                  status: "info"
                }
              ].map((activity, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-lg border">
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center
                    ${activity.status === 'success' ? 'bg-emerald-50 text-emerald-500' :
                      activity.status === 'warning' ? 'bg-yellow-50 text-yellow-500' :
                      'bg-blue-50 text-blue-500'}`}>
                    <activity.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium truncate">{activity.title}</h4>
                    <p className="text-sm text-muted-foreground truncate">
                      {activity.description}
                    </p>
                  </div>
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions Section */}
        <QuickActions />
      </div>
    </DashboardLayout>
  );
};

export default Index;

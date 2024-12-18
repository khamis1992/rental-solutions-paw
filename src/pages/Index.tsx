import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { UpcomingRentals } from "@/components/dashboard/UpcomingRentals";
import { DashboardAlerts } from "@/components/dashboard/DashboardAlerts";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Car, Clock, CheckCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const { data: recentActivities } = useQuery({
    queryKey: ["recent-activities"],
    queryFn: async () => {
      // Fetch recent vehicle additions
      const { data: vehicles } = await supabase
        .from("vehicles")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1);

      // Fetch recent agreement updates
      const { data: agreements } = await supabase
        .from("leases")
        .select(`
          *,
          vehicles (
            make,
            model
          )
        `)
        .order("updated_at", { ascending: false })
        .limit(1);

      // Fetch recent vehicle returns
      const { data: returns } = await supabase
        .from("leases")
        .select(`
          *,
          vehicles (
            make,
            model
          )
        `)
        .eq("status", "closed")
        .order("updated_at", { ascending: false })
        .limit(1);

      return {
        vehicleAddition: vehicles?.[0],
        agreementUpdate: agreements?.[0],
        vehicleReturn: returns?.[0],
      };
    },
  });

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diffInHours = Math.floor((now.getTime() - then.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours === 1) return "1h ago";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const activities = recentActivities ? [
    recentActivities.vehicleAddition && {
      icon: Car,
      title: "New Vehicle Added",
      description: `${recentActivities.vehicleAddition.year} ${recentActivities.vehicleAddition.make} ${recentActivities.vehicleAddition.model} - Added to fleet`,
      time: getTimeAgo(recentActivities.vehicleAddition.created_at),
      status: "success"
    },
    recentActivities.agreementUpdate && {
      icon: Clock,
      title: "Rental Agreement Updated",
      description: `Agreement #${recentActivities.agreementUpdate.agreement_number} - ${recentActivities.agreementUpdate.vehicles.make} ${recentActivities.agreementUpdate.vehicles.model}`,
      time: getTimeAgo(recentActivities.agreementUpdate.updated_at),
      status: "warning"
    },
    recentActivities.vehicleReturn && {
      icon: CheckCircle,
      title: "Vehicle Returned",
      description: `${recentActivities.vehicleReturn.vehicles.make} ${recentActivities.vehicleReturn.vehicles.model} returned`,
      time: getTimeAgo(recentActivities.vehicleReturn.updated_at),
      status: "info"
    }
  ].filter(Boolean) : [];

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
        {/* Upcoming Rentals - Spans 4 columns */}
        <UpcomingRentals />

        {/* Alerts & Notifications - Spans 3 columns */}
        <DashboardAlerts />
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
              {activities.map((activity, i) => (
                activity && (
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
                )
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
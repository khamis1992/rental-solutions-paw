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
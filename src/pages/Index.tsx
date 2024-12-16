import { 
  Car, DollarSign, Users, FileText, ArrowUpRight, 
  Plus, Clock, CheckCircle, AlertCircle
} from "lucide-react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <>
      <DashboardSidebar />
      <div className="flex-1">
        <DashboardHeader />
        <main className="container py-6">
          {/* Welcome Section */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Welcome back, Admin</h1>
              <p className="text-muted-foreground mt-1">
                Here's what's happening with your rental fleet today.
              </p>
            </div>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Rental
            </Button>
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

            {/* Quick Actions - Spans 3 columns */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {[
                    { icon: Car, label: "Add New Vehicle", color: "bg-blue-50 text-blue-500" },
                    { icon: Users, label: "Register Customer", color: "bg-purple-50 text-purple-500" },
                    { icon: FileText, label: "Create Agreement", color: "bg-emerald-50 text-emerald-500" },
                    { icon: AlertCircle, label: "Report Issue", color: "bg-red-50 text-red-500" }
                  ].map((action, i) => (
                    <button
                      key={i}
                      className="flex items-center gap-4 p-4 rounded-lg border hover:bg-accent transition-colors"
                    >
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${action.color}`}>
                        <action.icon className="h-5 w-5" />
                      </div>
                      <span className="font-medium">{action.label}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </>
  );
};

export default Index;
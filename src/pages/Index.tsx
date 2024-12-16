import { Car, DollarSign, Users, FileText, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <DashboardSidebar />
        <div className="flex-1">
          <DashboardHeader />
          <main className="container py-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold">Dashboard Overview</h1>
              <div className="flex gap-2">
                <span className="text-sm text-muted-foreground">
                  Last updated: {new Date().toLocaleString()}
                </span>
              </div>
            </div>
            
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

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-4 p-4 rounded-lg border">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Car className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium">New Vehicle Added</h4>
                          <p className="text-sm text-muted-foreground">
                            2024 Toyota Camry - Added to fleet
                          </p>
                        </div>
                        <span className="text-sm text-muted-foreground">2h ago</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent text-left">
                      <Car className="h-4 w-4" />
                      <span>Add New Vehicle</span>
                    </button>
                    <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent text-left">
                      <Users className="h-4 w-4" />
                      <span>Register Customer</span>
                    </button>
                    <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent text-left">
                      <FileText className="h-4 w-4" />
                      <span>Create Rental Agreement</span>
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
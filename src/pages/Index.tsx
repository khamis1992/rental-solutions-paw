import { Car, DollarSign, Users, FileText } from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { StatsCard } from "@/components/dashboard/StatsCard";

const Index = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <DashboardSidebar />
        <div className="flex-1">
          <DashboardHeader />
          <main className="container py-6">
            <h1 className="text-3xl font-bold mb-6">Dashboard Overview</h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatsCard
                title="Total Vehicles"
                value="124"
                icon={Car}
                description="+2 this month"
              />
              <StatsCard
                title="Active Customers"
                value="1,429"
                icon={Users}
                description="+18.2% from last month"
              />
              <StatsCard
                title="Active Rentals"
                value="89"
                icon={FileText}
                description="23 pending returns"
              />
              <StatsCard
                title="Monthly Revenue"
                value="$48,574"
                icon={DollarSign}
                description="+7.4% from last month"
              />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
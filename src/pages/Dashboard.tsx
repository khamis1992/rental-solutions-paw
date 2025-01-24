import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { DashboardAlerts } from "@/components/dashboard/DashboardAlerts";
import { WelcomeHeader } from "@/components/dashboard/WelcomeHeader";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { DashboardStats as DashboardStatsType } from "@/types/agreement.types";

const Dashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_dashboard_stats');
      if (error) throw error;
      return data as DashboardStatsType;
    }
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <WelcomeHeader />
        <div className="grid gap-6">
          <DashboardStats 
            totalVehicles={stats.total_vehicles}
            availableVehicles={stats.available_vehicles}
            rentedVehicles={stats.rented_vehicles}
            maintenanceVehicles={stats.maintenance_vehicles}
            totalCustomers={stats.total_customers}
            activeRentals={stats.active_rentals}
            monthlyRevenue={stats.monthly_revenue}
          />
          <DashboardAlerts />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
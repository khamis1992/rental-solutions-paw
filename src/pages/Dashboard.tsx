import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { DashboardAlerts } from "@/components/dashboard/DashboardAlerts";
import { WelcomeHeader } from "@/components/dashboard/WelcomeHeader";
import { supabase } from "@/integrations/supabase/client";

interface DashboardStats {
  totalVehicles: number;
  availableVehicles: number;
  rentedVehicles: number;
  maintenanceVehicles: number;
  totalCustomers: number;
  activeRentals: number;
  monthlyRevenue: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data, error } = await supabase.functions.invoke<DashboardStats>('get-dashboard-stats');
        if (error) throw error;
        setStats(data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-6">
        <WelcomeHeader />
        
        {stats && <DashboardStats 
          totalVehicles={stats.totalVehicles}
          availableVehicles={stats.availableVehicles}
          rentedVehicles={stats.rentedVehicles}
          maintenanceVehicles={stats.maintenanceVehicles}
          totalCustomers={stats.totalCustomers}
          activeRentals={stats.activeRentals}
          monthlyRevenue={stats.monthlyRevenue}
        />}
        
        <DashboardAlerts />
      </div>
    </DashboardLayout>
  );
}
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StatsCard } from "./StatsCard";
import { Car, Users, FileText, AlertTriangle } from "lucide-react";

export interface DashboardStats {
  totalVehicles: number;
  availableVehicles: number;
  totalCustomers: number;
  activeAgreements: number;
  pendingMaintenance: number;
  overduePayments: number;
}

export const DashboardStats = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      // Get vehicles stats
      const { data: vehicles, error: vehiclesError } = await supabase
        .from("vehicles")
        .select("id, status");
      
      if (vehiclesError) throw vehiclesError;

      // Get customers count
      const { count: customersCount, error: customersError } = await supabase
        .from("profiles")
        .select("*", { count: 'exact', head: true });

      if (customersError) throw customersError;

      // Get agreements stats
      const { data: agreements, error: agreementsError } = await supabase
        .from("leases")
        .select("id, status");

      if (agreementsError) throw agreementsError;

      // Get maintenance stats
      const { data: maintenance, error: maintenanceError } = await supabase
        .from("maintenance")
        .select("id, status");

      if (maintenanceError) throw maintenanceError;

      // Get overdue payments count
      const { count: overdueCount, error: overdueError } = await supabase
        .from("overdue_payments")
        .select("*", { count: 'exact', head: true });

      if (overdueError) throw overdueError;

      return {
        totalVehicles: vehicles?.length ?? 0,
        availableVehicles: vehicles?.filter(v => v.status === 'available')?.length ?? 0,
        totalCustomers: customersCount ?? 0,
        activeAgreements: agreements?.filter(a => a.status === 'active')?.length ?? 0,
        pendingMaintenance: maintenance?.filter(m => m.status === 'pending')?.length ?? 0,
        overduePayments: overdueCount ?? 0
      };
    }
  });

  if (isLoading) {
    return <div>Loading stats...</div>;
  }

  const defaultStats: DashboardStats = {
    totalVehicles: 0,
    availableVehicles: 0,
    totalCustomers: 0,
    activeAgreements: 0,
    pendingMaintenance: 0,
    overduePayments: 0
  };

  const currentStats = stats || defaultStats;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Total Vehicles"
        value={currentStats.totalVehicles}
        description={`${currentStats.availableVehicles} available`}
        icon={Car}
      />
      <StatsCard
        title="Total Customers"
        value={currentStats.totalCustomers}
        description="Active customers"
        icon={Users}
      />
      <StatsCard
        title="Active Agreements"
        value={currentStats.activeAgreements}
        description="Current agreements"
        icon={FileText}
      />
      <StatsCard
        title="Pending Actions"
        value={currentStats.pendingMaintenance + currentStats.overduePayments}
        description={`${currentStats.pendingMaintenance} maintenance, ${currentStats.overduePayments} payments`}
        icon={AlertTriangle}
      />
    </div>
  );
};
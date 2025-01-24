import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StatsCard } from "./StatsCard";
import { Car, Users, FileText, AlertTriangle } from "lucide-react";

export interface DashboardStats {
  totalVehicles: number;
  availableVehicles: number;
  rentedVehicles: number;
  maintenanceVehicles: number;
  totalCustomers: number;
  activeRentals: number;
  monthlyRevenue: number;
}

export const DashboardStats = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      // Get vehicles stats
      const { data: vehicles } = await supabase
        .from("vehicles")
        .select("status");

      const { data: customers } = await supabase
        .from("profiles")
        .select("id")
        .eq("role", "customer");

      const { data: activeLeases } = await supabase
        .from("leases")
        .select("id")
        .eq("status", "active");

      const { data: payments } = await supabase
        .from("unified_payments")
        .select("amount")
        .gte("payment_date", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
        .lte("payment_date", new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString())
        .eq("status", "completed");

      const vehiclesData = vehicles || [];
      const monthlyRevenue = payments?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;

      return {
        totalVehicles: vehiclesData.length,
        availableVehicles: vehiclesData.filter(v => v.status === "available").length,
        rentedVehicles: vehiclesData.filter(v => v.status === "rented").length,
        maintenanceVehicles: vehiclesData.filter(v => v.status === "maintenance").length,
        totalCustomers: customers?.length || 0,
        activeRentals: activeLeases?.length || 0,
        monthlyRevenue
      };
    }
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  const defaultStats: DashboardStats = {
    totalVehicles: 0,
    availableVehicles: 0,
    rentedVehicles: 0,
    maintenanceVehicles: 0,
    totalCustomers: 0,
    activeRentals: 0,
    monthlyRevenue: 0
  };

  const currentStats = stats || defaultStats;

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <StatsCard
        title="Total Vehicles"
        value={currentStats.totalVehicles.toString()}
        description={`${currentStats.availableVehicles} available`}
        icon={Car}
      />
      <StatsCard
        title="Total Customers"
        value={currentStats.totalCustomers.toString()}
        description="Active customers"
        icon={Users}
      />
      <StatsCard
        title="Active Rentals"
        value={currentStats.activeRentals.toString()}
        description="Current agreements"
        icon={FileText}
      />
      <StatsCard
        title="In Maintenance"
        value={currentStats.maintenanceVehicles.toString()}
        description="Vehicles under maintenance"
        icon={AlertTriangle}
      />
    </div>
  );
};
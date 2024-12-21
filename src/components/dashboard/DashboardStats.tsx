import { useQuery } from "@tanstack/react-query";
import { StatsCard } from "./StatsCard";
import { Car, Users, FileText, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const DashboardStats = () => {
  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const [vehicles, customers, agreements, alerts] = await Promise.all([
        supabase.from("vehicles").select("*", { count: "exact" }),
        supabase.from("profiles").select("*", { count: "exact" }),
        supabase.from("leases").select("*", { count: "exact" }),
        supabase.from("operational_anomalies").select("*", { count: "exact" }),
      ]);

      return {
        vehicles: vehicles.count || 0,
        customers: customers.count || 0,
        agreements: agreements.count || 0,
        alerts: alerts.count || 0,
      };
    },
  });

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Total Vehicles"
        value={stats?.vehicles.toString() || "0"}
        icon={Car}
        iconClassName="text-blue-500"
      />
      <StatsCard
        title="Total Customers"
        value={stats?.customers.toString() || "0"}
        icon={Users}
        iconClassName="text-green-500"
      />
      <StatsCard
        title="Active Agreements"
        value={stats?.agreements.toString() || "0"}
        icon={FileText}
        iconClassName="text-purple-500"
      />
      <StatsCard
        title="Active Alerts"
        value={stats?.alerts.toString() || "0"}
        icon={AlertTriangle}
        iconClassName="text-red-500"
      />
    </div>
  );
};
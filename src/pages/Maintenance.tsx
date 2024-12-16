import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MaintenanceList } from "@/components/maintenance/MaintenanceList";
import { MaintenanceStats } from "@/components/maintenance/MaintenanceStats";
import { MaintenanceFilters } from "@/components/maintenance/MaintenanceFilters";
import { CreateJobDialog } from "@/components/maintenance/CreateJobDialog";
import { supabase } from "@/integrations/supabase/client";

const Maintenance = () => {
  const [filters, setFilters] = useState({
    status: "all",
    serviceType: "",
    dateRange: "",
  });

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["maintenance", filters],
    queryFn: async () => {
      let query = supabase
        .from("maintenance")
        .select(`
          *,
          vehicles (
            make,
            model,
            year
          )
        `);

      if (filters.status !== "all") {
        query = query.eq("status", filters.status);
      }
      
      if (filters.serviceType) {
        query = query.ilike("service_type", `%${filters.serviceType}%`);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching maintenance records:", error);
        throw error;
      }

      return data || [];
    },
  });

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Maintenance</h1>
        <CreateJobDialog />
      </div>
      <MaintenanceStats records={records} isLoading={isLoading} />
      <div className="mt-6 space-y-4">
        <MaintenanceFilters filters={filters} setFilters={setFilters} />
        <MaintenanceList records={records} isLoading={isLoading} />
      </div>
    </DashboardLayout>
  );
};

export default Maintenance;
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { MaintenanceList } from "@/components/maintenance/MaintenanceList";
import { MaintenanceStats } from "@/components/maintenance/MaintenanceStats";
import { MaintenanceFilters } from "@/components/maintenance/MaintenanceFilters";
import { Button } from "@/components/ui/button";
import { Plus, ListFilter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Maintenance = () => {
  const [filters, setFilters] = useState({
    status: "all",
    serviceType: "",
    dateRange: "",
  });

  const { data: maintenanceRecords, isLoading } = useQuery({
    queryKey: ["maintenance", filters],
    queryFn: async () => {
      let query = supabase
        .from("maintenance")
        .select("*, vehicles(make, model, year)");

      if (filters.status && filters.status !== "all") {
        query = query.eq("status", filters.status);
      }
      if (filters.serviceType) {
        query = query.ilike("service_type", `%${filters.serviceType}%`);
      }

      const { data, error } = await query;
      
      if (error) {
        toast.error("Failed to fetch maintenance records");
        throw error;
      }
      
      return data;
    },
  });

  return (
    <>
      <DashboardSidebar />
      <div className="flex-1">
        <DashboardHeader />
        <main className="container py-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Maintenance</h1>
            <div className="flex gap-2">
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Schedule Maintenance
              </Button>
            </div>
          </div>
          
          <MaintenanceStats records={maintenanceRecords || []} isLoading={isLoading} />
          <MaintenanceFilters filters={filters} setFilters={setFilters} />
          <MaintenanceList records={maintenanceRecords || []} isLoading={isLoading} />
        </main>
      </div>
    </>
  );
};

export default Maintenance;
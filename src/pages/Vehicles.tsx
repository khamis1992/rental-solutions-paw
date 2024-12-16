import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { VehicleGrid } from "@/components/vehicles/VehicleGrid";
import { VehicleList } from "@/components/vehicles/VehicleList";
import { VehicleFilters } from "@/components/vehicles/VehicleFilters";
import { Button } from "@/components/ui/button";
import { LayoutGrid, List, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type ViewMode = "grid" | "list";

const Vehicles = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [filters, setFilters] = useState({
    status: "",
    make: "",
    model: "",
    year: "",
  });

  const { data: vehicles, isLoading } = useQuery({
    queryKey: ["vehicles", filters],
    queryFn: async () => {
      let query = supabase
        .from("vehicles")
        .select("*");

      if (filters.status) {
        query = query.eq("status", filters.status);
      }
      if (filters.make) {
        query = query.ilike("make", `%${filters.make}%`);
      }
      if (filters.model) {
        query = query.ilike("model", `%${filters.model}%`);
      }
      if (filters.year) {
        query = query.eq("year", filters.year);
      }

      const { data, error } = await query;
      
      if (error) {
        toast.error("Failed to fetch vehicles");
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
            <h1 className="text-3xl font-bold">Vehicles</h1>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}>
                {viewMode === "grid" ? <List className="h-5 w-5" /> : <LayoutGrid className="h-5 w-5" />}
              </Button>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add Vehicle
              </Button>
            </div>
          </div>
          
          <VehicleFilters filters={filters} setFilters={setFilters} />
          
          {viewMode === "grid" ? (
            <VehicleGrid vehicles={vehicles || []} isLoading={isLoading} />
          ) : (
            <VehicleList vehicles={vehicles || []} isLoading={isLoading} />
          )}
        </main>
      </div>
    </>
  );
};

export default Vehicles;
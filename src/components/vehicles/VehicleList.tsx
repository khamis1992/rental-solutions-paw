import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { VehicleGrid } from "./VehicleGrid";
import { AdvancedVehicleFilters, VehicleFilters } from "./filters/AdvancedVehicleFilters";
import { Vehicle } from "@/types/database/vehicle.types";
import { toast } from "sonner";

export const VehicleList = () => {
  const [filters, setFilters] = useState<VehicleFilters>({
    search: "",
    status: "all",
    location: "",
    makeModel: "",
    yearRange: {
      from: null,
      to: null,
    },
  });

  const { data: vehicles, isLoading } = useQuery({
    queryKey: ["vehicles", filters],
    queryFn: async () => {
      console.log("Fetching vehicles with filters:", filters);
      
      let query = supabase
        .from("vehicles")
        .select();

      // Apply filters
      if (filters.status !== "all") {
        query = query.eq("status", filters.status);
      }

      if (filters.location) {
        query = query.ilike("location", `%${filters.location}%`);
      }

      if (filters.makeModel) {
        query = query.or(`make.ilike.%${filters.makeModel}%,model.ilike.%${filters.makeModel}%`);
      }

      if (filters.yearRange.from) {
        query = query.gte("year", filters.yearRange.from);
      }

      if (filters.yearRange.to) {
        query = query.lte("year", filters.yearRange.to);
      }

      if (filters.search) {
        query = query.or(
          `license_plate.ilike.%${filters.search}%,` +
          `make.ilike.%${filters.search}%,` +
          `model.ilike.%${filters.search}%`
        );
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching vehicles:", error);
        toast.error("Failed to fetch vehicles");
        throw error;
      }

      return data as Vehicle[];
    },
  });

  if (isLoading) {
    return <div className="text-center py-4">Loading vehicles...</div>;
  }

  return (
    <div className="space-y-4">
      <AdvancedVehicleFilters onFilterChange={setFilters} />
      <VehicleGrid vehicles={vehicles || []} />
    </div>
  );
};
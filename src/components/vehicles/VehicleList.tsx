import { useState } from "react";
import { VehicleGrid } from "./VehicleGrid";
import { AdvancedVehicleFilters, VehicleFilters } from "./filters/AdvancedVehicleFilters";
import { Vehicle } from "@/types/database/vehicle.types";

interface VehicleListProps {
  vehicles: Vehicle[];
  isLoading: boolean;
}

export const VehicleList = ({ vehicles, isLoading }: VehicleListProps) => {
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
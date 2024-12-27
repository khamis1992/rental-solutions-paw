import { useState } from "react";
import { VehicleGrid } from "./VehicleGrid";
import { VehicleListView } from "./table/VehicleListView";
import { AdvancedVehicleFilters, VehicleFilters } from "./filters/AdvancedVehicleFilters";
import { Vehicle } from "@/types/database/vehicle.types";
import { Button } from "@/components/ui/button";
import { LayoutGrid, List } from "lucide-react";

interface VehicleListProps {
  vehicles: Vehicle[];
  isLoading: boolean;
}

export const VehicleList = ({ vehicles = [], isLoading }: VehicleListProps) => {
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

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Add console logs for debugging
  console.log("VehicleList rendering with:", {
    vehiclesLength: vehicles?.length,
    isLoading,
    viewMode,
    filters
  });

  if (isLoading) {
    return <div className="text-center py-4">Loading vehicles...</div>;
  }

  // Ensure vehicles is always an array
  const safeVehicles = Array.isArray(vehicles) ? vehicles : [];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <AdvancedVehicleFilters onFilterChange={setFilters} />
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('grid')}
            title="Grid View"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('list')}
            title="List View"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {viewMode === 'grid' ? (
        <VehicleGrid vehicles={safeVehicles} isLoading={isLoading} />
      ) : (
        <VehicleListView vehicles={safeVehicles} />
      )}
    </div>
  );
};
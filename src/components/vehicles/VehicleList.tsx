import { useState } from "react";
import { Vehicle, VehicleStatus } from "@/types/vehicle";
import { VehicleTableContent } from "./table/VehicleTableContent";
import { VehicleDetailsDialog } from "./VehicleDetailsDialog";
import { DeleteVehicleDialog } from "./DeleteVehicleDialog";
import { AdvancedVehicleFilters } from "./filters/AdvancedVehicleFilters";

interface VehicleListProps {
  vehicles: Vehicle[];
  isLoading: boolean;
}

export const VehicleList = ({ vehicles, isLoading }: VehicleListProps) => {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [filters, setFilters] = useState<{ status: VehicleStatus; searchQuery: string }>({
    status: "available",
    searchQuery: "",
  });

  const handleVehicleClick = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (vehicle) {
      setSelectedVehicle(vehicle);
      setShowDetailsDialog(true);
    }
  };

  const handleDeleteClick = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (vehicle) {
      setSelectedVehicle(vehicle);
      setShowDeleteDialog(true);
    }
  };

  return (
    <div className="space-y-4 pt-32">
      <AdvancedVehicleFilters
        onFiltersChange={setFilters}
        currentFilters={filters}
      />

      <VehicleTableContent
        vehicles={vehicles}
        isLoading={isLoading}
        onVehicleClick={handleVehicleClick}
        onDeleteClick={handleDeleteClick}
      />

      {selectedVehicle && (
        <>
          <DeleteVehicleDialog
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
            vehicleId={selectedVehicle.id}
          />
          <VehicleDetailsDialog
            vehicleId={selectedVehicle.id}
            open={showDetailsDialog}
            onOpenChange={setShowDetailsDialog}
          />
        </>
      )}
    </div>
  );
};
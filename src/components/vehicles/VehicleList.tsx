import { useState } from "react";
import { Vehicle, VehicleStatus, VehicleFilters } from "@/types/vehicle";
import { VehicleDetailsDialog } from "./VehicleDetailsDialog";
import { DeleteVehicleDialog } from "./DeleteVehicleDialog";
import { AdvancedVehicleFilters } from "./filters/AdvancedVehicleFilters";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface VehicleListProps {
  vehicles: Vehicle[];
  isLoading: boolean;
  onFilterChange: (filters: VehicleFilters) => void;
  onExportToExcel?: () => void;
}

export const VehicleList = ({
  vehicles,
  isLoading,
  onFilterChange,
  onExportToExcel
}: VehicleListProps) => {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [filters, setFilters] = useState<VehicleFilters>({
    status: "available",
    searchQuery: ""
  });

  const handleVehicleClick = (vehicleId: string) => {
    setSelectedVehicleId(vehicleId);
  };

  const handleFilterChange = (newFilters: VehicleFilters) => {
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);

  return (
    <div>
      <AdvancedVehicleFilters
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Make</TableHead>
            <TableHead>Model</TableHead>
            <TableHead>Year</TableHead>
            <TableHead>License Plate</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vehicles.map(vehicle => (
            <TableRow key={vehicle.id}>
              <TableCell>{vehicle.make}</TableCell>
              <TableCell>{vehicle.model}</TableCell>
              <TableCell>{vehicle.year}</TableCell>
              <TableCell>{vehicle.license_plate}</TableCell>
              <TableCell>{vehicle.status}</TableCell>
              <TableCell>
                <Button onClick={() => handleVehicleClick(vehicle.id)}>View</Button>
                <Button onClick={() => {
                  setSelectedVehicleId(vehicle.id);
                  setShowDeleteDialog(true);
                }}>Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedVehicleId && (
        <VehicleDetailsDialog
          vehicleId={selectedVehicleId}
          open={!!selectedVehicleId}
          onOpenChange={(open) => !open && setSelectedVehicleId(null)}
        />
      )}

      {showDeleteDialog && selectedVehicleId && (
        <DeleteVehicleDialog
          vehicleId={selectedVehicleId}
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
        />
      )}
    </div>
  );
};

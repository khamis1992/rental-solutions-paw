import { Table, TableBody } from "@/components/ui/table";
import { Vehicle } from "@/types/vehicle";
import { VehicleTableContent } from "./VehicleTableContent";

interface VehicleListViewProps {
  vehicles: Vehicle[];
  onVehicleClick: (id: string) => void;
  onVehicleSelect: (id: string, isSelected: boolean) => void;
  selectedVehicles: string[];
}

export const VehicleListView = ({
  vehicles,
  onVehicleClick,
  selectedVehicles,
  onVehicleSelect
}: VehicleListViewProps) => {
  const STATUS_COLORS: Record<string, string> = {
    available: "bg-green-100 text-green-800 border-green-200",
    rented: "bg-blue-100 text-blue-800 border-blue-200",
    maintenance: "bg-yellow-100 text-yellow-800 border-yellow-200",
    retired: "bg-gray-100 text-gray-800 border-gray-200"
  };

  const handleStatusChange = (vehicleId: string, newStatus: string) => {
    // Handle status change
  };

  const handleDeleteClick = (vehicleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Handle delete
  };

  const handleLicensePlateClick = (vehicleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onVehicleClick(vehicleId);
  };

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableBody>
          <VehicleTableContent
            vehicles={vehicles}
            onVehicleClick={onVehicleClick}
            onStatusChange={handleStatusChange}
            onDeleteClick={handleDeleteClick}
            onLicensePlateClick={handleLicensePlateClick}
            STATUS_COLORS={STATUS_COLORS}
          />
        </TableBody>
      </Table>
    </div>
  );
};
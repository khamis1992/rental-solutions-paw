import { Table, TableBody } from "@/components/ui/table";
import { Vehicle } from "@/types/database/vehicle.types";
import { VehicleTableContent } from "./VehicleTableContent";

interface VehicleListViewProps {
  vehicles: Vehicle[];
  onVehicleClick: (id: string) => void;
  selectedVehicles: string[];
  onVehicleSelect: (id: string, isSelected: boolean) => void;
}

export const VehicleListView = ({
  vehicles,
  onVehicleClick,
  selectedVehicles,
  onVehicleSelect
}: VehicleListViewProps) => {
  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableBody>
          <VehicleTableContent
            vehicles={vehicles}
            onVehicleClick={onVehicleClick}
            selectedVehicles={selectedVehicles}
            onVehicleSelect={onVehicleSelect}
          />
        </TableBody>
      </Table>
    </div>
  );
};
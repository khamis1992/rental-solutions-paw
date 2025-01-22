import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { VehicleStatusCell } from "./VehicleStatusCell";
import { VehicleLocationCell } from "./VehicleLocationCell";
import { VehicleInsuranceCell } from "./VehicleInsuranceCell";
import { Vehicle } from "@/types/vehicle";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";

interface VehicleTableContentProps {
  vehicles: Vehicle[];
  selectedVehicles: string[];
  onSelectionChange: (selectedIds: string[]) => void;
}

export const VehicleTableContent = ({
  vehicles,
  selectedVehicles,
  onSelectionChange,
}: VehicleTableContentProps) => {
  const [editingLocation, setEditingLocation] = useState<string | null>(null);
  const [editingInsurance, setEditingInsurance] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleCheckboxChange = (vehicleId: string) => {
    const updatedSelection = selectedVehicles.includes(vehicleId)
      ? selectedVehicles.filter(id => id !== vehicleId)
      : [...selectedVehicles, vehicleId];
    onSelectionChange(updatedSelection);
  };

  const handleLicensePlateClick = (vehicleId: string) => {
    navigate(`/vehicles/${vehicleId}`);
  };

  return (
    <>
      {vehicles.map((vehicle) => (
        <TableRow key={vehicle.id}>
          <TableCell>
            <Checkbox
              checked={selectedVehicles.includes(vehicle.id)}
              onCheckedChange={() => handleCheckboxChange(vehicle.id)}
            />
          </TableCell>
          <TableCell>
            <button
              onClick={() => handleLicensePlateClick(vehicle.id)}
              className="text-primary hover:underline focus:outline-none"
            >
              {vehicle.license_plate}
            </button>
          </TableCell>
          <TableCell>{vehicle.make}</TableCell>
          <TableCell>{vehicle.model}</TableCell>
          <TableCell>{vehicle.year}</TableCell>
          <TableCell>
            <VehicleStatusCell status={vehicle.status} />
          </TableCell>
          <TableCell>
            <VehicleLocationCell
              vehicleId={vehicle.id}
              isEditing={editingLocation === vehicle.id}
              location={vehicle.location}
              onEditStart={() => setEditingLocation(vehicle.id)}
              onEditEnd={() => setEditingLocation(null)}
            />
          </TableCell>
          <TableCell>
            <VehicleInsuranceCell
              vehicleId={vehicle.id}
              isEditing={editingInsurance === vehicle.id}
              insurance={vehicle.insurance_company}
              onEditStart={() => setEditingInsurance(vehicle.id)}
              onEditEnd={() => setEditingInsurance(null)}
            />
          </TableCell>
          <TableCell className="text-right">
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
};

import { TableCell, TableRow } from "@/components/ui/table";
import { Vehicle } from "@/types/vehicle";
import { VehicleStatusCell } from "./VehicleStatusCell";
import { VehicleLocationCell } from "./VehicleLocationCell";
import { VehicleInsuranceCell } from "./VehicleInsuranceCell";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2, FileText, MapPin, Car } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface VehicleTableContentProps {
  vehicles: Vehicle[];
  selectedVehicles: string[];
  onSelectionChange: (selectedIds: string[]) => void;
}

export const VehicleTableContent = ({ 
  vehicles,
  selectedVehicles,
  onSelectionChange 
}: VehicleTableContentProps) => {
  const [editingLocation, setEditingLocation] = useState<string | null>(null);
  const [editingInsurance, setEditingInsurance] = useState<string | null>(null);

  return (
    <>
      {vehicles.map((vehicle) => (
        <TableRow 
          key={vehicle.id}
          className={cn(
            "group hover:bg-muted/50 transition-all duration-200",
            selectedVehicles.includes(vehicle.id) && "bg-primary/5"
          )}
        >
          <TableCell className="w-12">
            <input
              type="checkbox"
              className="rounded border-gray-300"
              checked={selectedVehicles.includes(vehicle.id)}
              onChange={(e) => {
                if (e.target.checked) {
                  onSelectionChange([...selectedVehicles, vehicle.id]);
                } else {
                  onSelectionChange(selectedVehicles.filter(id => id !== vehicle.id));
                }
              }}
            />
          </TableCell>
          <TableCell>
            <Link 
              to={`/vehicles/${vehicle.id}`}
              className="flex items-center gap-2 font-medium text-primary hover:underline"
            >
              <Car className="h-4 w-4" />
              {vehicle.license_plate}
            </Link>
          </TableCell>
          <TableCell className="font-medium">{vehicle.make}</TableCell>
          <TableCell>{vehicle.model}</TableCell>
          <TableCell>{vehicle.year}</TableCell>
          <TableCell>
            <VehicleStatusCell 
              status={vehicle.status} 
              vehicleId={vehicle.id}
            />
          </TableCell>
          <TableCell>
            <VehicleLocationCell
              vehicleId={vehicle.id}
              location={vehicle.location || ''}
              isEditing={editingLocation === vehicle.id}
              onEditStart={() => setEditingLocation(vehicle.id)}
              onEditEnd={() => setEditingLocation(null)}
            />
          </TableCell>
          <TableCell>
            <VehicleInsuranceCell
              vehicleId={vehicle.id}
              insurance={vehicle.insurance_company || ''}
              isEditing={editingInsurance === vehicle.id}
              onEditStart={() => setEditingInsurance(vehicle.id)}
              onEditEnd={() => setEditingInsurance(null)}
            />
          </TableCell>
          <TableCell className="text-right">
            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Tooltip content="View Details">
                <Button variant="ghost" size="sm" asChild>
                  <Link to={`/vehicles/${vehicle.id}`}>
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
              </Tooltip>
              <Tooltip content="Edit Vehicle">
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
              </Tooltip>
              <Tooltip content="Delete Vehicle">
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </Tooltip>
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
};

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, MapPin } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  status: string;
  vin: string;
  mileage: number;
  license_plate: string;
  location: string | null;
}

interface VehicleTableContentProps {
  vehicles: Vehicle[];
  onVehicleClick?: (vehicleId: string) => void;
  onStatusChange: (vehicleId: string, newStatus: string) => void;
  onDeleteClick: (vehicleId: string, e: React.MouseEvent) => void;
  onLicensePlateClick: (vehicleId: string, e: React.MouseEvent) => void;
  STATUS_COLORS: Record<string, string>;
}

export const VehicleTableContent = ({
  vehicles,
  onVehicleClick,
  onStatusChange,
  onDeleteClick,
  onLicensePlateClick,
  STATUS_COLORS,
}: VehicleTableContentProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>License Plate</TableHead>
          <TableHead>Vehicle</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>VIN</TableHead>
          <TableHead>Mileage</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {vehicles.map((vehicle) => (
          <TableRow
            key={vehicle.id}
            className="cursor-pointer"
            onClick={() => onVehicleClick?.(vehicle.id)}
          >
            <TableCell>
              <button
                onClick={(e) => onLicensePlateClick(vehicle.id, e)}
                className="font-medium text-primary hover:underline focus:outline-none"
              >
                {vehicle.license_plate}
              </button>
            </TableCell>
            <TableCell>
              {vehicle.year} {vehicle.make} {vehicle.model}
            </TableCell>
            <TableCell>
              <Select
                value={vehicle.status}
                onValueChange={(value) => onStatusChange(vehicle.id, value)}
              >
                <SelectTrigger className="w-[140px]" onClick={(e) => e.stopPropagation()}>
                  <SelectValue>
                    <Badge
                      className="text-white"
                      style={{
                        backgroundColor: STATUS_COLORS[vehicle.status] || "#CBD5E1"
                      }}
                    >
                      {vehicle.status}
                    </Badge>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(STATUS_COLORS).map((status) => (
                    <SelectItem key={status} value={status}>
                      <Badge
                        className="text-white"
                        style={{
                          backgroundColor: STATUS_COLORS[status]
                        }}
                      >
                        {status}
                      </Badge>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TableCell>
            <TableCell>
              {vehicle.location ? (
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {vehicle.location}
                </div>
              ) : (
                <span className="text-muted-foreground">Not available</span>
              )}
            </TableCell>
            <TableCell>{vehicle.vin}</TableCell>
            <TableCell>{vehicle.mileage?.toLocaleString() || 0} km</TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                onClick={(e) => onDeleteClick(vehicle.id, e)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
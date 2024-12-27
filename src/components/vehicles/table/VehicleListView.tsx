import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { Vehicle } from "@/types/database/vehicle.types";

interface VehicleListViewProps {
  vehicles: Vehicle[];
  onVehicleClick?: (vehicleId: string) => void;
}

export const VehicleListView = ({ vehicles, onVehicleClick }: VehicleListViewProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Vehicle</TableHead>
            <TableHead>License Plate</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vehicles.map((vehicle) => (
            <TableRow key={vehicle.id} onClick={() => onVehicleClick?.(vehicle.id)} className="cursor-pointer">
              <TableCell>
                <div className="flex items-center gap-2">
                  {vehicle.image_url && (
                    <img
                      src={vehicle.image_url}
                      alt={`${vehicle.make} ${vehicle.model}`}
                      className="h-10 w-10 rounded-md object-cover"
                    />
                  )}
                  <div>
                    <p className="font-medium">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>{vehicle.license_plate}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    vehicle.status === "available"
                      ? "default"
                      : vehicle.status === "rented"
                      ? "secondary"
                      : "destructive"
                  }
                >
                  {vehicle.status}
                </Badge>
              </TableCell>
              <TableCell>
                {vehicle.location ? (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{vehicle.location}</span>
                  </div>
                ) : (
                  "Not available"
                )}
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="sm">
                  View Details
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
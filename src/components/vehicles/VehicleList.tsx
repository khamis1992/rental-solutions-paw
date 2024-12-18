import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  status: string;
  vin: string;
  mileage: number;
  license_plate: string;
}

interface VehicleListProps {
  vehicles: Vehicle[];
  isLoading: boolean;
  onVehicleClick?: (vehicleId: string) => void;
}

export const VehicleList = ({ vehicles, isLoading, onVehicleClick }: VehicleListProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>License Plate</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>VIN</TableHead>
                <TableHead>Mileage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>License Plate</TableHead>
            <TableHead>Vehicle</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>VIN</TableHead>
            <TableHead>Mileage</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vehicles.map((vehicle) => (
            <TableRow 
              key={vehicle.id}
              className="cursor-pointer"
              onClick={() => onVehicleClick?.(vehicle.id)}
            >
              <TableCell className="font-medium">
                {vehicle.license_plate}
              </TableCell>
              <TableCell>
                {vehicle.year} {vehicle.make} {vehicle.model}
              </TableCell>
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
              <TableCell>{vehicle.vin}</TableCell>
              <TableCell>{vehicle.mileage?.toLocaleString() || 0} km</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
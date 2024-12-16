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
import { Button } from "@/components/ui/button";

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  status: string;
  daily_rate: number;
  license_plate: string;
  vin: string;
  mileage: number;
}

interface VehicleListProps {
  vehicles: Vehicle[];
  isLoading: boolean;
  onVehicleClick?: (vehicleId: string) => void;
}

export const VehicleList = ({ vehicles, isLoading, onVehicleClick }: VehicleListProps) => {
  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vehicle</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>License Plate</TableHead>
              <TableHead>VIN</TableHead>
              <TableHead>Mileage</TableHead>
              <TableHead className="text-right">Daily Rate</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-4 w-[250px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-[100px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-[100px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-[150px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-[100px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-[100px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-[100px]" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Vehicle</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>License Plate</TableHead>
            <TableHead>VIN</TableHead>
            <TableHead>Mileage</TableHead>
            <TableHead className="text-right">Daily Rate</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vehicles.map((vehicle) => (
            <TableRow key={vehicle.id} className="cursor-pointer hover:bg-muted/50">
              <TableCell className="font-medium">
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
              <TableCell>{vehicle.license_plate}</TableCell>
              <TableCell>{vehicle.vin}</TableCell>
              <TableCell>{vehicle.mileage.toLocaleString()} km</TableCell>
              <TableCell className="text-right">
                {formatCurrency(vehicle.daily_rate)}/day
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onVehicleClick?.(vehicle.id)}
                >
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
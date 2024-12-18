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
import { Button } from "@/components/ui/button";

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  status: string;
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
  // Helper function to determine badge variant and color based on status
  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'available':
        return {
          variant: 'default' as const,
          className: 'bg-emerald-500 hover:bg-emerald-600'
        };
      case 'rented':
        return {
          variant: 'secondary' as const,
          className: 'bg-blue-500 hover:bg-blue-600 text-white'
        };
      case 'maintenance':
        return {
          variant: 'secondary' as const,
          className: 'bg-amber-500 hover:bg-amber-600 text-white'
        };
      case 'accident':
        return {
          variant: 'destructive' as const,
          className: 'bg-rose-500 hover:bg-rose-600'
        };
      case 'police_station':
        return {
          variant: 'secondary' as const,
          className: 'bg-purple-500 hover:bg-purple-600 text-white'
        };
      default:
        return {
          variant: 'secondary' as const,
          className: 'bg-slate-500 hover:bg-slate-600 text-white'
        };
    }
  };

  // Helper function to format status display
  const formatStatus = (status: string) => {
    if (status === 'police_station') {
      return 'Police Station';
    }
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

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
                  variant={getStatusStyles(vehicle.status).variant}
                  className={getStatusStyles(vehicle.status).className}
                >
                  {formatStatus(vehicle.status)}
                </Badge>
              </TableCell>
              <TableCell>{vehicle.license_plate}</TableCell>
              <TableCell>{vehicle.vin}</TableCell>
              <TableCell>{vehicle.mileage.toLocaleString()} km</TableCell>
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
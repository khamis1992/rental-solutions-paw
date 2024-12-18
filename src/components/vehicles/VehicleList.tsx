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

const STATUS_COLORS = {
  accident: "#F97316",      // Bright Orange
  available: "#0EA5E9",     // Ocean Blue
  maintenance: "#800000",   // Maroon
  police_station: "#D946EF", // Magenta Pink
  out_of_service: "#CA8A04", // Yellow
  stolen: "#EF4444",        // Red
  reserve: "#8B5CF6",       // Vivid Purple
  on_rent: "#22C55E"        // Green
} as const;

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
                  className="text-white"
                  style={{
                    backgroundColor: STATUS_COLORS[vehicle.status as keyof typeof STATUS_COLORS] || "#CBD5E1"
                  }}
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
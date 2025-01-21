import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { VehicleTableContent } from "./VehicleTableContent";
import { Vehicle } from "@/types/vehicle";
import { Skeleton } from "@/components/ui/skeleton";

interface VehicleListViewProps {
  vehicles: Vehicle[];
  isLoading: boolean;
  selectedVehicles: string[];
  onSelectionChange: (selectedIds: string[]) => void;
}

export const VehicleListView = ({
  vehicles,
  isLoading,
  selectedVehicles,
  onSelectionChange,
}: VehicleListViewProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (!vehicles.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No vehicles found
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead>License Plate</TableHead>
            <TableHead>Make</TableHead>
            <TableHead>Model</TableHead>
            <TableHead>Year</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Insurance</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <VehicleTableContent
            vehicles={vehicles}
            selectedVehicles={selectedVehicles}
            onSelectionChange={onSelectionChange}
          />
        </TableBody>
      </Table>
    </div>
  );
};
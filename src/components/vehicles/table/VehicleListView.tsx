
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { VehicleTableContent } from "./VehicleTableContent";
import { VehicleTablePagination } from "./VehicleTablePagination";
import { Vehicle } from "@/types/vehicle";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { VehicleCard } from "./VehicleCard";

interface VehicleListViewProps {
  vehicles: Vehicle[];
  isLoading: boolean;
  selectedVehicles: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isMobile: boolean;
}

export const VehicleListView = ({
  vehicles,
  isLoading,
  selectedVehicles,
  onSelectionChange,
  currentPage,
  totalPages,
  onPageChange,
  isMobile,
}: VehicleListViewProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {isMobile ? (
          <>
            <Skeleton className="h-[200px] w-full rounded-lg" />
            <Skeleton className="h-[200px] w-full rounded-lg" />
          </>
        ) : (
          <>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </>
        )}
      </div>
    );
  }

  if (!vehicles.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-background rounded-lg border">
        <div className="text-4xl mb-4">🚗</div>
        <h3 className="text-lg font-semibold mb-2">No vehicles found</h3>
        <p className="text-muted-foreground text-center px-4">
          Try adjusting your search or filters
        </p>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 auto-grid">
          {vehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              isSelected={selectedVehicles.includes(vehicle.id)}
              onSelect={(selected) => {
                if (selected) {
                  onSelectionChange([...selectedVehicles, vehicle.id]);
                } else {
                  onSelectionChange(selectedVehicles.filter(id => id !== vehicle.id));
                }
              }}
            />
          ))}
        </div>
        <div className="fixed bottom-4 left-0 right-0 px-4 z-10">
          <Card className="p-4 shadow-lg">
            <VehicleTablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
            />
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border shadow-sm">
      <div className="relative overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  className="rounded border-gray-300"
                  checked={selectedVehicles.length === vehicles.length}
                  onChange={(e) =>
                    onSelectionChange(
                      e.target.checked ? vehicles.map((v) => v.id) : []
                    )
                  }
                />
              </TableHead>
              <TableHead className="font-semibold">License Plate</TableHead>
              <TableHead className="font-semibold">Make</TableHead>
              <TableHead className="font-semibold">Model</TableHead>
              <TableHead className="font-semibold">Year</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Location</TableHead>
              <TableHead className="font-semibold">Insurance</TableHead>
              <TableHead className="text-right font-semibold">Actions</TableHead>
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
      
      <div className="border-t">
        <VehicleTablePagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
};

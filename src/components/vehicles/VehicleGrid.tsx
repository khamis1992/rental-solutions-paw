import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { VehicleDetailsDialog } from "./VehicleDetailsDialog";

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  status: string;
  daily_rate: number;
  image_url: string;
  license_plate: string;
}

interface VehicleGridProps {
  vehicles: Vehicle[];
  isLoading: boolean;
  onVehicleClick?: (vehicleId: string) => void;
}

export const VehicleGrid = ({ vehicles, isLoading }: VehicleGridProps) => {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="h-48 rounded-b-none" />
            <CardContent className="mt-4">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {vehicles.map((vehicle) => (
          <Card
            key={vehicle.id}
            className="overflow-hidden group hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="relative h-48 bg-muted">
              {vehicle.image_url ? (
                <img
                  src={vehicle.image_url || `https://picsum.photos/seed/${vehicle.id}/800/400`}
                  alt={`${vehicle.make} ${vehicle.model}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  No image available
                </div>
              )}
              <Badge
                className="absolute top-2 right-2"
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
            </div>
            <CardContent className="mt-4">
              <h3 className="text-lg font-semibold">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </h3>
              <p 
                className="text-sm text-muted-foreground cursor-pointer hover:underline"
                onClick={() => setSelectedVehicleId(vehicle.id)}
              >
                License: {vehicle.license_plate}
              </p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <p className="text-lg font-semibold">
                {formatCurrency(vehicle.daily_rate)}/day
              </p>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSelectedVehicleId(vehicle.id)}
              >
                View Details
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <VehicleDetailsDialog
        vehicleId={selectedVehicleId || ""}
        open={!!selectedVehicleId}
        onOpenChange={(open) => !open && setSelectedVehicleId(null)}
      />
    </>
  );
};
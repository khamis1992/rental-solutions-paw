import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MaintenanceTracker } from "../maintenance/MaintenanceTracker";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Vehicle } from "@/types/vehicle";
import { Skeleton } from "@/components/ui/skeleton";

interface VehicleOverviewProps {
  vehicleId: string;
}

export const VehicleOverview = ({ vehicleId }: VehicleOverviewProps) => {
  const { data: vehicle, isLoading } = useQuery({
    queryKey: ["vehicle", vehicleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .eq("id", vehicleId)
        .single();

      if (error) throw error;
      return data as Vehicle;
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Vehicle Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {[...Array(6)].map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Skeleton className="h-[200px] w-full" />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">Vehicle not found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium">Make</p>
              <p className="text-sm text-muted-foreground">{vehicle.make}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Model</p>
              <p className="text-sm text-muted-foreground">{vehicle.model}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Year</p>
              <p className="text-sm text-muted-foreground">{vehicle.year}</p>
            </div>
            <div>
              <p className="text-sm font-medium">License Plate</p>
              <p className="text-sm text-muted-foreground">{vehicle.license_plate}</p>
            </div>
            <div>
              <p className="text-sm font-medium">VIN</p>
              <p className="text-sm text-muted-foreground">{vehicle.vin}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Mileage</p>
              <p className="text-sm text-muted-foreground">{vehicle.mileage?.toLocaleString()} km</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <MaintenanceTracker vehicleId={vehicle.id} />
    </div>
  );
};
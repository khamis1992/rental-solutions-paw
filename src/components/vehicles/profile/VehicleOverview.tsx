import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MaintenanceTracker } from "../maintenance/MaintenanceTracker";
import { Vehicle } from "@/types/vehicle";

interface VehicleOverviewProps {
  vehicle: Vehicle;
}

export const VehicleOverview = ({ vehicle }: VehicleOverviewProps) => {
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
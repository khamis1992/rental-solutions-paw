import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, Calendar, Palette, Key, Hash, Gauge } from "lucide-react";

interface VehicleInfoCardProps {
  vehicle: {
    make: string;
    model: string;
    year: number;
    color?: string;
    license_plate: string;
    vin: string;
  };
  initialMileage?: number;
}

export const VehicleInfoCard = ({ vehicle, initialMileage }: VehicleInfoCardProps) => {
  return (
    <Card className="bg-white hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Car className="h-5 w-5 text-orange-500" />
          Vehicle Information
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Car className="h-4 w-4 text-orange-500" />
              Make & Model
            </div>
            <div className="font-semibold">{vehicle.make} {vehicle.model}</div>
          </div>

          <div className="space-y-1">
            <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4 text-orange-500" />
              Year
            </div>
            <div>{vehicle.year}</div>
          </div>

          {vehicle.color && (
            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Palette className="h-4 w-4 text-orange-500" />
                Color
              </div>
              <div>{vehicle.color}</div>
            </div>
          )}

          <div className="space-y-1">
            <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Key className="h-4 w-4 text-orange-500" />
              License Plate
            </div>
            <div>{vehicle.license_plate}</div>
          </div>

          <div className="space-y-1">
            <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Hash className="h-4 w-4 text-orange-500" />
              VIN
            </div>
            <div className="font-mono text-sm">{vehicle.vin}</div>
          </div>

          {initialMileage !== undefined && (
            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Gauge className="h-4 w-4 text-orange-500" />
                Initial Mileage
              </div>
              <div>{initialMileage.toLocaleString()} km</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
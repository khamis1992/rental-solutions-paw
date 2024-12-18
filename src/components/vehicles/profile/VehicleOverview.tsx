import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, Calendar, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface VehicleOverviewProps {
  vehicle: {
    make: string;
    model: string;
    year: number;
    color?: string;
    license_plate: string;
    vin: string;
    status?: string;
    mileage?: number;
    description?: string;
  };
}

export const VehicleOverview = ({ vehicle }: VehicleOverviewProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Car className="mr-2 h-5 w-5" />
          Vehicle Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="space-y-2">
          <div className="flex justify-between">
            <dt className="font-medium">Make:</dt>
            <dd>{vehicle.make}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="font-medium">Model:</dt>
            <dd>{vehicle.model}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="font-medium">Year:</dt>
            <dd>{vehicle.year}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="font-medium">Color:</dt>
            <dd>{vehicle.color}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="font-medium">License Plate:</dt>
            <dd>{vehicle.license_plate}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="font-medium">VIN:</dt>
            <dd>{vehicle.vin}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="font-medium">Mileage:</dt>
            <dd>{vehicle.mileage?.toLocaleString()} km</dd>
          </div>
          <div className="flex justify-between">
            <dt className="font-medium">Status:</dt>
            <dd>
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
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
};
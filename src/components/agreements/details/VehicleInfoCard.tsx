import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Car } from "lucide-react";

interface VehicleInfoCardProps {
  vehicle: {
    year?: number;
    make?: string;
    model?: string;
    license_plate?: string;
  };
  initialMileage: number;
}

export const VehicleInfoCard = ({ vehicle, initialMileage }: VehicleInfoCardProps) => {
  return (
    <Card className="bg-white border border-gray-200 shadow-card hover:shadow-card-hover transition-shadow duration-200">
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Vehicle Information</h3>
          <Car className="h-5 w-5 text-primary" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-600">Vehicle</Label>
            <p className="text-base font-medium text-gray-900">
              {`${vehicle?.year || ''} ${vehicle?.make || ''} ${vehicle?.model || ''}`}
            </p>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-600">License Plate</Label>
            <p className="text-base font-medium text-gray-900">{vehicle?.license_plate || 'N/A'}</p>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-600">Initial Mileage</Label>
            <p className="text-base font-medium text-gray-900">{initialMileage.toLocaleString()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
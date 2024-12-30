import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface VehicleInfoCardProps {
  vehicle: {
    year?: number;
    make?: string;
    model?: string;
    license_plate?: string;
  };
  initialMileage: number;
  totalAmount: number;
}

export const VehicleInfoCard = ({ vehicle, initialMileage, totalAmount }: VehicleInfoCardProps) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-lg font-semibold mb-4">Vehicle Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Vehicle</Label>
            <p>{`${vehicle?.year} ${vehicle?.make} ${vehicle?.model}`}</p>
          </div>
          <div>
            <Label>License Plate</Label>
            <p>{vehicle?.license_plate}</p>
          </div>
          <div>
            <Label>Initial Mileage</Label>
            <p>{initialMileage}</p>
          </div>
          <div>
            <Label>Total Amount</Label>
            <p>{totalAmount} QAR</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
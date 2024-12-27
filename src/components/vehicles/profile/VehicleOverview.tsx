import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, Calendar, Info, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { VehicleStatus } from "./VehicleStatus";
import { VehicleStatus as VehicleStatusType } from "@/types/vehicle";

interface VehicleOverviewProps {
  vehicle: {
    make: string;
    model: string;
    year: number;
    color?: string;
    license_plate: string;
    vin: string;
    status?: VehicleStatusType;
    mileage?: number;
    description?: string;
    id: string;
  };
}

export const VehicleOverview = ({ vehicle }: VehicleOverviewProps) => {
  // Fetch insurance information
  const { data: insurance } = useQuery({
    queryKey: ["vehicle-insurance", vehicle.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicle_insurance")
        .select("*")
        .eq("vehicle_id", vehicle.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-4">
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

      {/* Add the new status management component */}
      <VehicleStatus vehicleId={vehicle.id} currentStatus={vehicle.status || 'available'} />

      {/* Insurance Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5" />
            Insurance Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="font-medium">Policy Number:</dt>
              <dd>{insurance?.policy_number || "N/A"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium">Provider:</dt>
              <dd>{insurance?.provider || "N/A"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium">Coverage Type:</dt>
              <dd>{insurance?.coverage_type || "N/A"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium">Coverage Amount:</dt>
              <dd>
                {insurance?.coverage_amount
                  ? `$${insurance.coverage_amount.toLocaleString()}`
                  : "N/A"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium">Premium Amount:</dt>
              <dd>
                {insurance?.premium_amount
                  ? `$${insurance.premium_amount.toLocaleString()}`
                  : "N/A"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium">Start Date:</dt>
              <dd>
                {insurance?.start_date
                  ? new Date(insurance.start_date).toLocaleDateString()
                  : "N/A"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium">End Date:</dt>
              <dd>
                {insurance?.end_date
                  ? new Date(insurance.end_date).toLocaleDateString()
                  : "N/A"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium">Status:</dt>
              <dd>
                <Badge
                  variant={insurance?.status === "active" ? "default" : "secondary"}
                >
                  {insurance?.status || "N/A"}
                </Badge>
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
};
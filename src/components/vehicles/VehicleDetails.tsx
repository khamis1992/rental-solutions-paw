import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Car, Calendar, Wrench, Info, Image as ImageIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface VehicleDetailsProps {
  vehicleId: string;
}

export const VehicleDetails = ({ vehicleId }: VehicleDetailsProps) => {
  const { data: vehicle, isLoading: isLoadingVehicle } = useQuery({
    queryKey: ["vehicle", vehicleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .eq("id", vehicleId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: maintenanceHistory, isLoading: isLoadingMaintenance } = useQuery({
    queryKey: ["maintenance", vehicleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("maintenance")
        .select("*")
        .eq("vehicle_id", vehicleId)
        .order("scheduled_date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoadingVehicle) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[200px] w-full" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-[150px]" />
          <Skeleton className="h-[150px]" />
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return <div>Vehicle not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Vehicle Image */}
      <div className="relative h-[300px] w-full overflow-hidden rounded-lg bg-muted">
        {vehicle.image_url ? (
          <img
            src={vehicle.image_url}
            alt={`${vehicle.make} ${vehicle.model}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ImageIcon className="h-12 w-12 text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">No image available</span>
          </div>
        )}
        <Badge
          className="absolute right-4 top-4"
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

      {/* Vehicle Information Grid */}
      <div className="grid gap-6 md:grid-cols-2">
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
                <dt className="font-medium">Daily Rate:</dt>
                <dd>{formatCurrency(vehicle.daily_rate)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Mileage:</dt>
                <dd>{vehicle.mileage?.toLocaleString()} km</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Wrench className="mr-2 h-5 w-5" />
              Maintenance History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingMaintenance ? (
              <Skeleton className="h-[200px] w-full" />
            ) : maintenanceHistory && maintenanceHistory.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {maintenanceHistory.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{record.service_type}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            record.status === "completed"
                              ? "default"
                              : record.status === "in_progress"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {record.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(record.scheduled_date).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-muted-foreground">
                No maintenance history available
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Information */}
      {vehicle.description && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Info className="mr-2 h-5 w-5" />
              Additional Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{vehicle.description}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { VehicleDetailsDialog } from "./VehicleDetailsDialog";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const STATUS_COLORS = {
  accident: "#F97316",      // Bright Orange
  available: "#0EA5E9",     // Ocean Blue
  maintenance: "#800000",   // Maroon
  police_station: "#D946EF", // Magenta Pink
  out_of_service: "#CA8A04", // Yellow
  stolen: "#EF4444",        // Red
  reserve: "#8B5CF6",       // Vivid Purple
  on_rent: "#22C55E"        // Green
} as const;

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  status: string;
  vin: string;
  mileage: number;
  license_plate: string;
}

interface VehicleListProps {
  vehicles: Vehicle[];
  isLoading: boolean;
  onVehicleClick?: (vehicleId: string) => void;
}

export const VehicleList = ({ vehicles, isLoading, onVehicleClick }: VehicleListProps) => {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [showVehicleDetails, setShowVehicleDetails] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateVehicleStatus = useMutation({
    mutationFn: async ({ vehicleId, newStatus }: { vehicleId: string; newStatus: string }) => {
      const { error } = await supabase
        .from('vehicles')
        .update({ status: newStatus })
        .eq('id', vehicleId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast({
        title: "Status updated",
        description: "Vehicle status has been updated successfully",
      });
    },
    onError: (error) => {
      console.error('Error updating vehicle status:', error);
      toast({
        title: "Error",
        description: "Failed to update vehicle status",
        variant: "destructive",
      });
    },
  });

  const handleLicensePlateClick = (vehicleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedVehicleId(vehicleId);
    setShowVehicleDetails(true);
  };

  const handleStatusChange = (vehicleId: string, newStatus: string) => {
    updateVehicleStatus.mutate({ vehicleId, newStatus });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>License Plate</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>VIN</TableHead>
                <TableHead>Mileage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>License Plate</TableHead>
            <TableHead>Vehicle</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>VIN</TableHead>
            <TableHead>Mileage</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vehicles.map((vehicle) => (
            <TableRow 
              key={vehicle.id}
              className="cursor-pointer"
              onClick={() => onVehicleClick?.(vehicle.id)}
            >
              <TableCell>
                <button
                  onClick={(e) => handleLicensePlateClick(vehicle.id, e)}
                  className="font-medium text-primary hover:underline focus:outline-none"
                >
                  {vehicle.license_plate}
                </button>
              </TableCell>
              <TableCell>
                {vehicle.year} {vehicle.make} {vehicle.model}
              </TableCell>
              <TableCell>
                <Select
                  defaultValue={vehicle.status}
                  onValueChange={(value) => handleStatusChange(vehicle.id, value)}
                  onClick={(e) => e.stopPropagation()}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue>
                      <Badge
                        className="text-white"
                        style={{
                          backgroundColor: STATUS_COLORS[vehicle.status as keyof typeof STATUS_COLORS] || "#CBD5E1"
                        }}
                      >
                        {vehicle.status}
                      </Badge>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(STATUS_COLORS).map((status) => (
                      <SelectItem key={status} value={status}>
                        <Badge
                          className="text-white"
                          style={{
                            backgroundColor: STATUS_COLORS[status as keyof typeof STATUS_COLORS]
                          }}
                        >
                          {status}
                        </Badge>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>{vehicle.vin}</TableCell>
              <TableCell>{vehicle.mileage?.toLocaleString() || 0} km</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedVehicleId && (
        <VehicleDetailsDialog
          vehicleId={selectedVehicleId}
          open={showVehicleDetails}
          onOpenChange={setShowVehicleDetails}
        />
      )}
    </div>
  );
};
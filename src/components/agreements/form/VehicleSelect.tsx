import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Vehicle } from "@/types/vehicle";

interface VehicleSelectProps {
  register: any;
  onVehicleSelect: (vehicleId: string) => void;
}

export const VehicleSelect = ({ register, onVehicleSelect }: VehicleSelectProps) => {
  // Query to fetch available vehicles
  const { data: vehicles = [], refetch } = useQuery({
    queryKey: ["available-vehicles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .eq("status", "available")
        .order("make", { ascending: true });

      if (error) {
        console.error("Error fetching vehicles:", error);
        throw error;
      }

      return data as Vehicle[];
    },
  });

  // Subscribe to real-time updates for vehicle status changes
  useEffect(() => {
    const channel = supabase
      .channel('vehicle-status-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vehicles',
          filter: 'status=eq.available'
        },
        () => {
          // Refetch vehicles when there's any change to available vehicles
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  return (
    <div className="space-y-2">
      <Label htmlFor="vehicleId">Vehicle</Label>
      <Select 
        {...register("vehicleId")}
        onValueChange={(value) => {
          register("vehicleId").onChange({
            target: { value },
          });
          onVehicleSelect(value);
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select vehicle" />
        </SelectTrigger>
        <SelectContent>
          {vehicles.length === 0 ? (
            <SelectItem value="no-vehicles" disabled>
              No available vehicles
            </SelectItem>
          ) : (
            vehicles.map((vehicle) => (
              <SelectItem 
                key={vehicle.id} 
                value={vehicle.id || 'undefined-id'} // Ensure we never pass an empty string
              >
                {vehicle.year} {vehicle.make} {vehicle.model} ({vehicle.license_plate})
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
};
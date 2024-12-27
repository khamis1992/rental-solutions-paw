import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Vehicle } from "@/types/vehicle";
import { EnhancedSelect } from "@/components/ui/enhanced-select";
import { Label } from "@/components/ui/label";

interface VehicleSelectProps {
  register: any;
  onVehicleSelect: (vehicleId: string) => void;
}

export const VehicleSelect = ({ register, onVehicleSelect }: VehicleSelectProps) => {
  const { data: vehicles = [], isLoading, error } = useQuery({
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

  const vehicleOptions = vehicles.map((vehicle) => ({
    value: vehicle.id,
    label: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
    description: `License Plate: ${vehicle.license_plate}`,
  }));

  return (
    <div className="space-y-2">
      <Label htmlFor="vehicleId">Vehicle</Label>
      <EnhancedSelect
        options={vehicleOptions}
        placeholder="Select vehicle"
        searchPlaceholder="Search vehicles..."
        loading={isLoading}
        error={error ? "Error loading vehicles. Please try again." : undefined}
        onValueChange={(value) => {
          register("vehicleId").onChange({
            target: { value },
          });
          onVehicleSelect(value);
        }}
      />
    </div>
  );
};
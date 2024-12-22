import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Vehicle } from "@/types/vehicle";
import { Input } from "@/components/ui/input";

interface VehicleSelectProps {
  register: any;
  onVehicleSelect: (vehicleId: string) => void;
}

export const VehicleSelect = ({ register, onVehicleSelect }: VehicleSelectProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Query to fetch available vehicles
  const { data: vehicles = [], isLoading, error } = useQuery({
    queryKey: ["available-vehicles", searchTerm],
    queryFn: async () => {
      console.log("Fetching vehicles with search term:", searchTerm);
      let query = supabase
        .from("vehicles")
        .select("*")
        .eq("status", "available");

      if (searchTerm) {
        query = query.or(
          `make.ilike.%${searchTerm}%,` +
          `model.ilike.%${searchTerm}%,` +
          `license_plate.ilike.%${searchTerm}%`
        );
      }

      const { data, error } = await query.order("make", { ascending: true });

      if (error) {
        console.error("Error fetching vehicles:", error);
        throw error;
      }

      return data as Vehicle[];
    },
  });

  const filteredVehicles = vehicles || [];

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
          <SelectGroup>
            <div className="px-3 py-2">
              <Input
                placeholder="Search vehicles..."
                value={searchTerm}
                onChange={(e) => {
                  console.log("Search term changed:", e.target.value);
                  setSearchTerm(e.target.value);
                }}
                className="mb-2"
              />
            </div>
            {isLoading ? (
              <SelectItem value="loading" disabled>
                Loading vehicles...
              </SelectItem>
            ) : error ? (
              <SelectItem value="error" disabled>
                Error loading vehicles
              </SelectItem>
            ) : filteredVehicles.length === 0 ? (
              <SelectItem value="no-vehicles" disabled>
                {searchTerm ? `No vehicles found matching "${searchTerm}"` : "No available vehicles"}
              </SelectItem>
            ) : (
              filteredVehicles.map((vehicle) => (
                <SelectItem 
                  key={vehicle.id} 
                  value={vehicle.id || 'undefined-id'}
                >
                  {vehicle.year} {vehicle.make} {vehicle.model} ({vehicle.license_plate})
                </SelectItem>
              ))
            )}
          </SelectGroup>
        </SelectContent>
      </Select>
      {error && (
        <p className="text-sm text-red-500">
          Error loading vehicles. Please try again.
        </p>
      )}
    </div>
  );
};
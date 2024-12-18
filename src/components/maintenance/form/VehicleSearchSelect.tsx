import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { Label } from "@/components/ui/label";

interface Vehicle {
  id: string;
  make: string;
  model: string;
  license_plate: string;
}

interface VehicleSearchSelectProps {
  vehicles: Vehicle[];
  selectedVehicleId: string;
  onVehicleSelect: (vehicleId: string) => void;
}

export function VehicleSearchSelect({ 
  vehicles = [], 
  selectedVehicleId, 
  onVehicleSelect 
}: VehicleSearchSelectProps) {
  const [open, setOpen] = useState(false);

  const selectedVehicle = vehicles.find((vehicle) => vehicle.id === selectedVehicleId);

  return (
    <div className="space-y-2">
      <Label htmlFor="vehicle_id">Vehicle</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedVehicleId && selectedVehicle ? (
              `${selectedVehicle.make} ${selectedVehicle.model} (${selectedVehicle.license_plate})`
            ) : (
              "Select a vehicle"
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search vehicles..." />
            <CommandEmpty>No vehicle found.</CommandEmpty>
            <CommandGroup>
              {vehicles.map((vehicle) => (
                <CommandItem
                  key={vehicle.id}
                  value={`${vehicle.make} ${vehicle.model} ${vehicle.license_plate}`}
                  onSelect={() => {
                    onVehicleSelect(vehicle.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedVehicleId === vehicle.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {vehicle.make} {vehicle.model} ({vehicle.license_plate})
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
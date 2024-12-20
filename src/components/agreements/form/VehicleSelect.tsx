import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface VehicleSelectProps {
  register: any;
  onVehicleSelect: (vehicleId: string) => void;
}

export const VehicleSelect = ({ register, onVehicleSelect }: VehicleSelectProps) => {
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
          <SelectItem value="1">2024 Toyota Camry</SelectItem>
          <SelectItem value="2">2023 Honda CR-V</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
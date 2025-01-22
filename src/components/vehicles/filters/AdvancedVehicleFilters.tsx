import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VehicleStatus } from "@/types/vehicle";

interface AdvancedVehicleFiltersProps {
  searchQuery: string;
  statusFilter: VehicleStatus | "all";
  onSearchChange: (value: string) => void;
  onStatusChange: (value: VehicleStatus | "all") => void;
}

export const AdvancedVehicleFilters = ({
  searchQuery,
  statusFilter,
  onSearchChange,
  onStatusChange,
}: AdvancedVehicleFiltersProps) => {
  return (
    <div className="flex gap-4">
      <Select
        value={statusFilter}
        onValueChange={(value) => onStatusChange(value as VehicleStatus | "all")}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="available">Available</SelectItem>
          <SelectItem value="rented">Rented</SelectItem>
          <SelectItem value="maintenance">Maintenance</SelectItem>
          <SelectItem value="retired">Retired</SelectItem>
          <SelectItem value="police_station">Police Station</SelectItem>
          <SelectItem value="accident">Accident</SelectItem>
          <SelectItem value="reserve">Reserve</SelectItem>
          <SelectItem value="stolen">Stolen</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
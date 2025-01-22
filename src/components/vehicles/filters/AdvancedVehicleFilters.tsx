import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AdvancedVehicleFiltersProps {
  searchQuery: string;
  statusFilter: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

export const AdvancedVehicleFilters = ({
  searchQuery,
  statusFilter,
  onSearchChange,
  onStatusChange,
}: AdvancedVehicleFiltersProps) => {
  return (
    <Select value={statusFilter} onValueChange={onStatusChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Filter by status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Vehicles</SelectItem>
        <SelectItem value="available">Available</SelectItem>
        <SelectItem value="rented">Rented</SelectItem>
        <SelectItem value="maintenance">In Maintenance</SelectItem>
        <SelectItem value="reserved">Reserved</SelectItem>
      </SelectContent>
    </Select>
  );
};
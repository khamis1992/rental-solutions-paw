import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface VehicleFilters {
  status: string;
  searchQuery: string;
}

interface VehicleFiltersProps {
  filters: VehicleFilters;
  setFilters: (filters: VehicleFilters) => void;
}

// Helper function to format status for display
const formatStatus = (status: string) => {
  switch (status) {
    case 'police_station':
      return 'Police Station';
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
};

export const VehicleFilters = ({
  filters,
  setFilters,
}: VehicleFiltersProps) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="w-full md:w-1/3">
        <Select
          value={filters.status}
          onValueChange={(value) =>
            setFilters({ ...filters, status: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="rented">Rented</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
            <SelectItem value="police_station">{formatStatus('police_station')}</SelectItem>
            <SelectItem value="accident">Accident</SelectItem>
            <SelectItem value="reserve">Reserve</SelectItem>
            <SelectItem value="stolen">Stolen</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="w-full md:w-1/3">
        <Input
          placeholder="Search vehicles..."
          value={filters.searchQuery}
          onChange={(e) =>
            setFilters({ ...filters, searchQuery: e.target.value })
          }
        />
      </div>
    </div>
  );
};
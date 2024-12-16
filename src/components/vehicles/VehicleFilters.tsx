import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface VehicleFiltersProps {
  filters: {
    status: string;
    make: string;
    model: string;
    year: string;
  };
  setFilters: React.Dispatch<
    React.SetStateAction<{
      status: string;
      make: string;
      model: string;
      year: string;
    }>
  >;
}

export const VehicleFilters = ({ filters, setFilters }: VehicleFiltersProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-4 mb-6">
      <Select
        value={filters.status}
        onValueChange={(value) =>
          setFilters((prev) => ({ ...prev, status: value }))
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
          <SelectItem value="retired">Retired</SelectItem>
        </SelectContent>
      </Select>

      <Input
        placeholder="Make"
        value={filters.make}
        onChange={(e) =>
          setFilters((prev) => ({ ...prev, make: e.target.value }))
        }
      />

      <Input
        placeholder="Model"
        value={filters.model}
        onChange={(e) =>
          setFilters((prev) => ({ ...prev, model: e.target.value }))
        }
      />

      <Input
        placeholder="Year"
        type="number"
        value={filters.year}
        onChange={(e) =>
          setFilters((prev) => ({ ...prev, year: e.target.value }))
        }
      />
    </div>
  );
};
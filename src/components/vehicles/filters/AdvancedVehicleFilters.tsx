import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

export interface VehicleFilters {
  search: string;
  status: string;
  location: string;
  makeModel: string;
  yearRange: {
    from: number | null;
    to: number | null;
  };
}

interface AdvancedVehicleFiltersProps {
  onFilterChange: (filters: VehicleFilters) => void;
}

export const AdvancedVehicleFilters = ({ onFilterChange }: AdvancedVehicleFiltersProps) => {
  const [filters, setFilters] = useState<VehicleFilters>({
    search: "",
    status: "all",
    location: "",
    makeModel: "",
    yearRange: {
      from: null,
      to: null,
    },
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleFilterChange = (key: keyof VehicleFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-6 space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search vehicles by make, model, license plate..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="pl-10 w-full"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2"
        >
          <SlidersHorizontal className="h-4 w-4" />
          {showAdvanced ? "Hide Filters" : "Show Filters"}
        </Button>
      </div>

      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
          <Select
            value={filters.status}
            onValueChange={(value) => handleFilterChange("status", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="rented">Rented</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="police_station">Police Station</SelectItem>
              <SelectItem value="accident">Accident</SelectItem>
              <SelectItem value="reserve">Reserve</SelectItem>
              <SelectItem value="stolen">Stolen</SelectItem>
            </SelectContent>
          </Select>

          <Input
            placeholder="Location..."
            value={filters.location}
            onChange={(e) => handleFilterChange("location", e.target.value)}
            className="w-full"
          />

          <Input
            placeholder="Make/Model..."
            value={filters.makeModel}
            onChange={(e) => handleFilterChange("makeModel", e.target.value)}
            className="w-full"
          />
        </div>
      )}
    </div>
  );
};
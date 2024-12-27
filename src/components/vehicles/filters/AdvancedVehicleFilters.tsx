import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VehicleStatus } from "@/types/database/vehicle.types";
import { Search, SlidersHorizontal } from "lucide-react";

interface AdvancedVehicleFiltersProps {
  onFilterChange: (filters: VehicleFilters) => void;
}

export interface VehicleFilters {
  search: string;
  status: VehicleStatus | "all";
  location: string;
  makeModel: string;
  yearRange: {
    from: number | null;
    to: number | null;
  };
}

export const AdvancedVehicleFilters = ({ onFilterChange }: AdvancedVehicleFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
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

  const handleFilterChange = (key: keyof VehicleFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="space-y-4 bg-white p-4 rounded-lg shadow-sm">
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search vehicles..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="pl-8"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Advanced Filters
        </Button>
      </div>

      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          <Select
            value={filters.status}
            onValueChange={(value) => handleFilterChange("status", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="rented">Rented</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="retired">Retired</SelectItem>
            </SelectContent>
          </Select>

          <Input
            placeholder="Location"
            value={filters.location}
            onChange={(e) => handleFilterChange("location", e.target.value)}
          />

          <Input
            placeholder="Make/Model"
            value={filters.makeModel}
            onChange={(e) => handleFilterChange("makeModel", e.target.value)}
          />

          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Year from"
              onChange={(e) => 
                handleFilterChange("yearRange", {
                  ...filters.yearRange,
                  from: e.target.value ? parseInt(e.target.value) : null
                })
              }
            />
            <Input
              type="number"
              placeholder="Year to"
              onChange={(e) => 
                handleFilterChange("yearRange", {
                  ...filters.yearRange,
                  to: e.target.value ? parseInt(e.target.value) : null
                })
              }
            />
          </div>
        </div>
      )}
    </div>
  );
};
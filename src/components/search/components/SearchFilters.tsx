import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { X } from "lucide-react";
import { SearchFilters } from "../types/search.types";

interface SearchFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
}

export const SearchFilters = ({ filters, onFiltersChange }: SearchFiltersProps) => {
  const getStatusOptions = () => {
    switch (filters.entityType) {
      case "customers":
        return ["active", "inactive", "pending"];
      case "rentals":
        return ["active", "pending", "completed", "cancelled"];
      case "vehicles":
        return ["available", "rented", "maintenance", "retired"];
      default:
        return [];
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Search In</label>
        <Select
          value={filters.entityType}
          onValueChange={(value: "customers" | "rentals" | "vehicles") =>
            onFiltersChange({ ...filters, entityType: value })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="customers">Customers</SelectItem>
            <SelectItem value="rentals">Rentals</SelectItem>
            <SelectItem value="vehicles">Vehicles</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Status</label>
        <Select
          value={filters.status}
          onValueChange={(value) => onFiltersChange({ ...filters, status: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Any status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Any status</SelectItem>
            {getStatusOptions().map((status) => (
              <SelectItem key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Date Range</label>
        <DatePickerWithRange
          value={filters.dateRange}
          onChange={(range) => onFiltersChange({ ...filters, dateRange: range as Required<typeof range> })}
        />
      </div>

      <Button
        variant="ghost"
        className="w-full"
        onClick={() =>
          onFiltersChange({
            entityType: filters.entityType,
            keyword: "",
          })
        }
      >
        <X className="mr-2 h-4 w-4" />
        Clear Filters
      </Button>
    </div>
  );
};
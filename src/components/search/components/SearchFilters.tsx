import { SearchFilters, SearchFiltersProps } from '../types/search.types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export function SearchFilters({ filters, onFilterChange }: SearchFiltersProps) {
  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Select
          value={filters.entityType}
          onValueChange={(value) => 
            onFilterChange({ ...filters, entityType: value as SearchFilters['entityType'] })
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="customer">Customers</SelectItem>
            <SelectItem value="vehicle">Vehicles</SelectItem>
            <SelectItem value="agreement">Agreements</SelectItem>
          </SelectContent>
        </Select>

        <Input
          placeholder="Search..."
          value={filters.keyword}
          onChange={(e) => onFilterChange({ ...filters, keyword: e.target.value })}
          className="flex-1"
        />
      </div>
    </div>
  );
}
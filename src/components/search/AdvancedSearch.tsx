import { useState } from "react";
import { Search, Filter, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { SearchResults } from "./SearchResults";
import { useDebounce } from "@/hooks/use-debounce";
import { toast } from "sonner";

interface SearchFilters {
  entityType: "customers" | "rentals" | "vehicles";
  status?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
  keyword: string;
}

export const AdvancedSearch = () => {
  const [filters, setFilters] = useState<SearchFilters>({
    entityType: "customers",
    keyword: "",
  });
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const debouncedKeyword = useDebounce(filters.keyword, 300);

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ["advanced-search", filters.entityType, debouncedKeyword, filters.status, filters.dateRange],
    queryFn: async () => {
      try {
        let query = supabase.from(filters.entityType);

        // Base search conditions based on entity type
        if (filters.keyword) {
          switch (filters.entityType) {
            case "customers":
              query = query.or(`full_name.ilike.%${filters.keyword}%,phone_number.ilike.%${filters.keyword}%`);
              break;
            case "rentals":
              query = query.or(`agreement_number.ilike.%${filters.keyword}%`);
              break;
            case "vehicles":
              query = query.or(`make.ilike.%${filters.keyword}%,model.ilike.%${filters.keyword}%,license_plate.ilike.%${filters.keyword}%`);
              break;
          }
        }

        // Apply status filter if selected
        if (filters.status) {
          query = query.eq("status", filters.status);
        }

        // Apply date range filter if selected
        if (filters.dateRange?.from && filters.dateRange?.to) {
          const dateField = filters.entityType === "rentals" ? "start_date" : "created_at";
          query = query
            .gte(dateField, filters.dateRange.from.toISOString())
            .lte(dateField, filters.dateRange.to.toISOString());
        }

        const { data, error } = await query.select();

        if (error) throw error;
        return data;
      } catch (error) {
        console.error("Search error:", error);
        toast.error("Failed to perform search");
        return [];
      }
    },
    enabled: !!debouncedKeyword || !!filters.status || !!(filters.dateRange?.from && filters.dateRange?.to),
  });

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
    <div className="w-full space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={`Search ${filters.entityType}...`}
            value={filters.keyword}
            onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
            className="pl-8"
          />
        </div>
        <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Search Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search In</label>
                <Select
                  value={filters.entityType}
                  onValueChange={(value: "customers" | "rentals" | "vehicles") =>
                    setFilters({ ...filters, entityType: value })
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
                  onValueChange={(value) => setFilters({ ...filters, status: value })}
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
                  onChange={(range) => setFilters({ ...filters, dateRange: range })}
                />
              </div>

              <Button
                variant="ghost"
                className="w-full"
                onClick={() =>
                  setFilters({
                    entityType: filters.entityType,
                    keyword: "",
                  })
                }
              >
                <X className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {isLoading ? (
        <div className="text-center py-4">Loading results...</div>
      ) : searchResults?.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground">No results found</div>
      ) : (
        <SearchResults results={searchResults} entityType={filters.entityType} />
      )}
    </div>
  );
};
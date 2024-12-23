import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { SearchFilters } from "./components/SearchFilters";
import { useAdvancedSearch } from "./hooks/useAdvancedSearch";
import { SearchFilters as SearchFiltersType } from "./types/search.types";

export const AdvancedSearch = () => {
  const [filters, setFilters] = useState<SearchFiltersType>({
    entityType: "customers",
    keyword: "",
  });

  const {
    searchResults,
    isLoading,
    error,
    isFiltersOpen,
    setIsFiltersOpen
  } = useAdvancedSearch(filters);

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
              <Search className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Search Filters</SheetTitle>
            </SheetHeader>
            <SearchFilters
              filters={filters}
              onFiltersChange={setFilters}
            />
          </SheetContent>
        </Sheet>
      </div>

      {isLoading ? (
        <div className="text-center py-4">Loading results...</div>
      ) : error ? (
        <div className="text-center py-4 text-red-500">Error loading results</div>
      ) : searchResults?.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground">No results found</div>
      ) : (
        <div className="space-y-4">
          {searchResults?.map((result: any) => (
            <div
              key={result.id}
              className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
            >
              {filters.entityType === "customers" && (
                <div>
                  <h3 className="font-medium">{result.full_name}</h3>
                  <p className="text-sm text-muted-foreground">{result.phone_number}</p>
                </div>
              )}
              {filters.entityType === "rentals" && (
                <div>
                  <h3 className="font-medium">Agreement #{result.agreement_number}</h3>
                  <p className="text-sm text-muted-foreground">Status: {result.status}</p>
                </div>
              )}
              {filters.entityType === "vehicles" && (
                <div>
                  <h3 className="font-medium">{result.year} {result.make} {result.model}</h3>
                  <p className="text-sm text-muted-foreground">{result.license_plate}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
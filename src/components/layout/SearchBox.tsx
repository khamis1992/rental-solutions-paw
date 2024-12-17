import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";

type SearchResult = {
  id: string;
  type: 'vehicle' | 'customer';
  title: string;
  subtitle: string;
};

export const SearchBox = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);

  const { data: searchResults = [] } = useQuery({
    queryKey: ['search', debouncedSearch],
    queryFn: async () => {
      if (!debouncedSearch) return [];

      const results: SearchResult[] = [];

      // Search vehicles
      const { data: vehicles } = await supabase
        .from('vehicles')
        .select('id, make, model, year, license_plate')
        .or(`make.ilike.%${debouncedSearch}%,model.ilike.%${debouncedSearch}%,license_plate.ilike.%${debouncedSearch}%`)
        .limit(5);

      if (vehicles) {
        results.push(
          ...vehicles.map(vehicle => ({
            id: vehicle.id,
            type: 'vehicle' as const,
            title: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
            subtitle: `License: ${vehicle.license_plate}`
          }))
        );
      }

      // Search customers
      const { data: customers } = await supabase
        .from('profiles')
        .select('id, full_name, phone_number')
        .ilike('full_name', `%${debouncedSearch}%`)
        .limit(5);

      if (customers) {
        results.push(
          ...customers.map(customer => ({
            id: customer.id,
            type: 'customer' as const,
            title: customer.full_name || 'Unknown',
            subtitle: customer.phone_number || 'No phone number'
          }))
        );
      }

      return results;
    },
    enabled: debouncedSearch.length > 0,
  });

  const handleSearchResultClick = (result: SearchResult) => {
    if (result.type === 'vehicle') {
      navigate(`/vehicles?id=${result.id}`);
    } else {
      navigate(`/customers/${result.id}`);
    }
    setSearchQuery('');
  };

  return (
    <div className="relative w-full md:w-[300px] lg:w-[400px]">
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search vehicles, customers..."
        className="pl-8"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      {searchResults.length > 0 && searchQuery && (
        <div className="absolute top-full left-0 w-full mt-2 py-1 bg-popover rounded-md border shadow-lg z-50">
          {searchResults.map((result) => (
            <button
              key={`${result.type}-${result.id}`}
              className="w-full px-4 py-2 text-left hover:bg-accent flex flex-col"
              onClick={() => handleSearchResultClick(result)}
            >
              <span className="font-medium">{result.title}</span>
              <span className="text-sm text-muted-foreground">{result.subtitle}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
import { CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Loader2 } from "lucide-react";

interface SearchResult {
  id: string;
  make?: string;
  model?: string;
  year?: number;
  license_plate?: string;
  full_name?: string;
  phone_number?: string;
  agreement_number?: string;
  vehicles?: {
    make: string;
    model: string;
  };
}

interface SearchResultsProps {
  isLoading: boolean;
  error: unknown;
  searchQuery: string;
  searchResults: {
    vehicles: SearchResult[];
    customers: SearchResult[];
    agreements: SearchResult[];
  } | undefined;
  handleSelect: (type: string, id: string) => void;
}

export const SearchResults = ({
  isLoading,
  error,
  searchQuery,
  searchResults,
  handleSelect,
}: SearchResultsProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return <CommandEmpty>Error loading results. Please try again.</CommandEmpty>;
  }

  if (!searchQuery) {
    return <CommandEmpty>Start typing to search...</CommandEmpty>;
  }

  if (searchQuery.length < 2) {
    return <CommandEmpty>Please enter at least 2 characters...</CommandEmpty>;
  }

  if (
    !searchResults?.vehicles.length &&
    !searchResults?.customers.length &&
    !searchResults?.agreements.length
  ) {
    return <CommandEmpty>No results found.</CommandEmpty>;
  }

  return (
    <>
      {searchResults?.vehicles.length > 0 && (
        <CommandGroup heading="Vehicles">
          {searchResults.vehicles.map((vehicle) => (
            <CommandItem
              key={vehicle.id}
              onSelect={() => handleSelect("vehicle", vehicle.id)}
            >
              {vehicle.year} {vehicle.make} {vehicle.model} - {vehicle.license_plate}
            </CommandItem>
          ))}
        </CommandGroup>
      )}

      {searchResults?.customers.length > 0 && (
        <CommandGroup heading="Customers">
          {searchResults.customers.map((customer) => (
            <CommandItem
              key={customer.id}
              onSelect={() => handleSelect("customer", customer.id)}
            >
              {customer.full_name} - {customer.phone_number}
            </CommandItem>
          ))}
        </CommandGroup>
      )}

      {searchResults?.agreements.length > 0 && (
        <CommandGroup heading="Agreements">
          {searchResults.agreements.map((agreement) => (
            <CommandItem
              key={agreement.id}
              onSelect={() => handleSelect("agreement", agreement.id)}
            >
              Agreement #{agreement.agreement_number} - {agreement.vehicles?.make}{" "}
              {agreement.vehicles?.model}
            </CommandItem>
          ))}
        </CommandGroup>
      )}
    </>
  );
};
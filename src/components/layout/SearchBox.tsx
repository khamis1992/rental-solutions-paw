import { useState, useCallback } from "react";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { VehicleDetailsDialog } from "@/components/vehicles/VehicleDetailsDialog";
import { CustomerDetailsDialog } from "@/components/customers/CustomerDetailsDialog";
import { AgreementDetailsDialog } from "@/components/agreements/AgreementDetailsDialog";
import { useDebounce } from "@/hooks/use-debounce";

export const SearchBox = () => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300); // 300ms delay
  
  // Dialog states
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [selectedAgreement, setSelectedAgreement] = useState<string | null>(null);

  const { data: searchResults, error, isLoading } = useQuery({
    queryKey: ["search", debouncedSearch],
    queryFn: async () => {
      if (debouncedSearch.length < 2) return { vehicles: [], customers: [], agreements: [] };

      try {
        // Parallel queries for better performance
        const [vehiclesPromise, customersPromise, agreementsPromise] = await Promise.all([
          supabase
            .from("vehicles")
            .select("id, make, model, year, license_plate")
            .ilike("make", `%${debouncedSearch}%`)
            .or(`model.ilike.%${debouncedSearch}%,license_plate.ilike.%${debouncedSearch}%`)
            .limit(5),

          supabase
            .from("profiles")
            .select("id, full_name, phone_number")
            .ilike("full_name", `%${debouncedSearch}%`)
            .or(`phone_number.ilike.%${debouncedSearch}%`)
            .limit(5),

          supabase
            .from("leases")
            .select("id, agreement_number, vehicles(make, model)")
            .ilike("agreement_number", `%${debouncedSearch}%`)
            .limit(5),
        ]);

        return {
          vehicles: vehiclesPromise.data || [],
          customers: customersPromise.data || [],
          agreements: agreementsPromise.data || [],
        };
      } catch (error) {
        console.error("Search error:", error);
        toast.error("Failed to fetch search results");
        throw error;
      }
    },
    enabled: debouncedSearch.length >= 2,
    staleTime: 30000, // Cache results for 30 seconds
    cacheTime: 60000, // Keep cache for 1 minute
    retry: 1,
  });

  const handleSelect = useCallback((type: string, id: string) => {
    setOpen(false);
    switch (type) {
      case "vehicle":
        setSelectedVehicle(id);
        break;
      case "customer":
        setSelectedCustomer(id);
        break;
      case "agreement":
        setSelectedAgreement(id);
        break;
    }
  }, []);

  return (
    <>
      <div className="relative w-full md:w-80">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search vehicles, customers, agreements..."
          className="pl-8"
          onClick={() => setOpen(true)}
        />
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          placeholder="Type to search..." 
          value={searchQuery}
          onValueChange={setSearchQuery}
        />
        <CommandList>
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <CommandEmpty>Error loading results. Please try again.</CommandEmpty>
          ) : !searchQuery ? (
            <CommandEmpty>Start typing to search...</CommandEmpty>
          ) : searchQuery.length < 2 ? (
            <CommandEmpty>Please enter at least 2 characters...</CommandEmpty>
          ) : !searchResults?.vehicles.length && 
             !searchResults?.customers.length && 
             !searchResults?.agreements.length ? (
            <CommandEmpty>No results found.</CommandEmpty>
          ) : (
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
                      Agreement #{agreement.agreement_number} - {agreement.vehicles?.make} {agreement.vehicles?.model}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </>
          )}
        </CommandList>
      </CommandDialog>

      {/* Details Dialogs */}
      {selectedVehicle && (
        <VehicleDetailsDialog
          vehicleId={selectedVehicle}
          open={!!selectedVehicle}
          onOpenChange={(open) => !open && setSelectedVehicle(null)}
        />
      )}
      
      {selectedCustomer && (
        <CustomerDetailsDialog
          customerId={selectedCustomer}
          open={!!selectedCustomer}
          onOpenChange={(open) => !open && setSelectedCustomer(null)}
        />
      )}
      
      {selectedAgreement && (
        <AgreementDetailsDialog
          agreementId={selectedAgreement}
          open={!!selectedAgreement}
          onOpenChange={(open) => !open && setSelectedAgreement(null)}
        />
      )}
    </>
  );
};
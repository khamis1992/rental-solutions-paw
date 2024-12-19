import { useState } from "react";
import { Search } from "lucide-react";
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

export const SearchBox = () => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Dialog states
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [selectedAgreement, setSelectedAgreement] = useState<string | null>(null);

  const { data: searchResults, error } = useQuery({
    queryKey: ["search", searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 2) return { vehicles: [], customers: [], agreements: [] };

      try {
        const [vehiclesResponse, customersResponse, agreementsResponse] = await Promise.all([
          supabase
            .from("vehicles")
            .select("id, make, model, year, license_plate")
            .or(`make.ilike.%${searchQuery}%,model.ilike.%${searchQuery}%,license_plate.ilike.%${searchQuery}%`)
            .limit(5),
          supabase
            .from("profiles")
            .select("id, full_name")
            .ilike("full_name", `%${searchQuery}%`)
            .limit(5),
          supabase
            .from("leases")
            .select("id, agreement_number")
            .ilike("agreement_number", `%${searchQuery}%`)
            .limit(5),
        ]);

        if (vehiclesResponse.error) throw vehiclesResponse.error;
        if (customersResponse.error) throw customersResponse.error;
        if (agreementsResponse.error) throw agreementsResponse.error;

        return {
          vehicles: vehiclesResponse.data || [],
          customers: customersResponse.data || [],
          agreements: agreementsResponse.data || [],
        };
      } catch (err) {
        console.error("Search error:", err);
        toast.error("Error performing search");
        return { vehicles: [], customers: [], agreements: [] };
      }
    },
    enabled: searchQuery.length >= 2,
  });

  const handleSelect = (type: string, id: string) => {
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
  };

  const hasResults = searchResults && (
    searchResults.vehicles.length > 0 ||
    searchResults.customers.length > 0 ||
    searchResults.agreements.length > 0
  );

  return (
    <>
      <div className="relative w-[400px]">
        <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search vehicles, customers, agreements..."
          className="pl-8 w-full bg-background"
          onClick={() => setOpen(true)}
        />
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          placeholder="Search vehicles, customers, agreements..." 
          value={searchQuery}
          onValueChange={setSearchQuery}
        />
        <CommandList>
          {searchQuery.length < 2 ? (
            <CommandEmpty>Type at least 2 characters to search...</CommandEmpty>
          ) : error ? (
            <CommandEmpty>Error performing search. Please try again.</CommandEmpty>
          ) : !hasResults ? (
            <CommandEmpty>No results found.</CommandEmpty>
          ) : (
            <>
              {searchResults.vehicles.length > 0 && (
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
              
              {searchResults.customers.length > 0 && (
                <CommandGroup heading="Customers">
                  {searchResults.customers.map((customer) => (
                    <CommandItem
                      key={customer.id}
                      onSelect={() => handleSelect("customer", customer.id)}
                    >
                      {customer.full_name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              
              {searchResults.agreements.length > 0 && (
                <CommandGroup heading="Agreements">
                  {searchResults.agreements.map((agreement) => (
                    <CommandItem
                      key={agreement.id}
                      onSelect={() => handleSelect("agreement", agreement.id)}
                    >
                      Agreement #{agreement.agreement_number}
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
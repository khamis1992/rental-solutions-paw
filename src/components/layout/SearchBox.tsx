import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
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

export const SearchBox = () => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const { data: searchResults } = useQuery({
    queryKey: ["search", searchQuery],
    queryFn: async () => {
      if (!searchQuery) return { vehicles: [], customers: [], agreements: [] };

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

      return {
        vehicles: vehiclesResponse.data || [],
        customers: customersResponse.data || [],
        agreements: agreementsResponse.data || [],
      };
    },
    enabled: searchQuery.length > 0,
  });

  const handleSelect = (type: string, id: string) => {
    setOpen(false);
    switch (type) {
      case "vehicle":
        navigate(`/vehicles/${id}`);
        break;
      case "customer":
        navigate(`/customers/${id}`);
        break;
      case "agreement":
        navigate(`/agreements/${id}`);
        break;
    }
  };

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
          <CommandEmpty>No results found.</CommandEmpty>
          {searchResults && (
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
    </>
  );
};
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SearchResult {
  vehicles: Array<{
    id: string;
    make: string;
    model: string;
    year: number;
    license_plate: string;
  }>;
  customers: Array<{
    id: string;
    full_name: string;
    phone_number: string;
  }>;
  agreements: Array<{
    id: string;
    agreement_number: string;
    customer_name: string;
  }>;
}

export const SearchBox = () => {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult>({
    vehicles: [],
    customers: [],
    agreements: [],
  });
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  const transformAgreements = (agreements: any[]) => {
    return agreements.map(agreement => ({
      id: agreement.id,
      agreement_number: agreement.agreement_number,
      customer_name: agreement.customer?.full_name || 'Unknown Customer'
    }));
  };

  const handleSearch = async (query: string) => {
    if (!query) {
      setSearchResults({ vehicles: [], customers: [], agreements: [] });
      return;
    }

    try {
      const [vehiclesRes, customersRes, agreementsRes] = await Promise.all([
        supabase
          .from('vehicles')
          .select('id, make, model, year, license_plate')
          .or(`make.ilike.%${query}%,model.ilike.%${query}%,license_plate.ilike.%${query}%`)
          .limit(5),
        supabase
          .from('profiles')
          .select('id, full_name, phone_number')
          .or(`full_name.ilike.%${query}%,phone_number.ilike.%${query}%`)
          .limit(5),
        supabase
          .from('leases')
          .select(`
            id,
            agreement_number,
            customer:profiles(full_name)
          `)
          .or(`agreement_number.ilike.%${query}%`)
          .limit(5),
      ]);

      setSearchResults({
        vehicles: vehiclesRes.data || [],
        customers: customersRes.data || [],
        agreements: transformAgreements(agreementsRes.data || []),
      });
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to perform search');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    handleSearch(value);
  };

  const handleResultClick = (type: string, id: string) => {
    switch (type) {
      case 'vehicle':
        navigate(`/vehicles/${id}`);
        break;
      case 'customer':
        navigate(`/customers/${id}`);
        break;
      case 'agreement':
        navigate(`/agreements/${id}`);
        break;
    }
    setQuery("");
    setSearchResults({ vehicles: [], customers: [], agreements: [] });
  };

  return (
    <div className="relative">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={query}
            onChange={handleInputChange}
            className="pl-8"
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          disabled={isSearching}
          onClick={() => handleSearch(query)}
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {(searchResults.vehicles.length > 0 ||
        searchResults.customers.length > 0 ||
        searchResults.agreements.length > 0) && (
        <div className="absolute top-full mt-2 w-full rounded-md border bg-background shadow-lg">
          {searchResults.vehicles.length > 0 && (
            <div className="p-2">
              <h3 className="mb-2 text-sm font-medium">Vehicles</h3>
              {searchResults.vehicles.map((vehicle) => (
                <Button
                  key={vehicle.id}
                  variant="ghost"
                  className="w-full justify-start text-left"
                  onClick={() => handleResultClick('vehicle', vehicle.id)}
                >
                  {vehicle.make} {vehicle.model} ({vehicle.year}) - {vehicle.license_plate}
                </Button>
              ))}
            </div>
          )}

          {searchResults.customers.length > 0 && (
            <div className="p-2">
              <h3 className="mb-2 text-sm font-medium">Customers</h3>
              {searchResults.customers.map((customer) => (
                <Button
                  key={customer.id}
                  variant="ghost"
                  className="w-full justify-start text-left"
                  onClick={() => handleResultClick('customer', customer.id)}
                >
                  {customer.full_name} - {customer.phone_number}
                </Button>
              ))}
            </div>
          )}

          {searchResults.agreements.length > 0 && (
            <div className="p-2">
              <h3 className="mb-2 text-sm font-medium">Agreements</h3>
              {searchResults.agreements.map((agreement) => (
                <Button
                  key={agreement.id}
                  variant="ghost"
                  className="w-full justify-start text-left"
                  onClick={() => handleResultClick('agreement', agreement.id)}
                >
                  {agreement.agreement_number} - {agreement.customer_name}
                </Button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
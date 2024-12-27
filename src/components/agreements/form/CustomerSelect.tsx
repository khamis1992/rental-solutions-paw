import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { SearchInput } from "@/components/ui/search-input";
import { CustomerSelectProps } from "./types/customerSelect.types";
import { CreateCustomerDialog } from "@/components/customers/CreateCustomerDialog";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

export const CustomerSelect = ({ register, onCustomerSelect }: CustomerSelectProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateCustomer, setShowCreateCustomer] = useState(false);

  // Query to fetch available customers
  const { data: customers = [], isLoading, error } = useQuery({
    queryKey: ["available-customers", searchTerm],
    queryFn: async () => {
      console.log("Fetching customers with search term:", searchTerm);
      let query = supabase
        .from("profiles")
        .select("*")
        .eq("role", "customer");

      if (searchTerm) {
        query = query.or(
          `full_name.ilike.%${searchTerm}%,` +
          `email.ilike.%${searchTerm}%,` +
          `phone_number.ilike.%${searchTerm}%`
        );
      }

      const { data, error } = await query.order("full_name", { ascending: true });

      if (error) {
        console.error("Error fetching customers:", error);
        throw error;
      }

      return data;
    },
  });

  const filteredCustomers = customers || [];

  const handleCreateNewCustomer = () => {
    setShowCreateCustomer(true);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="customerId">Customer</Label>
      <Select 
        {...register("customerId")}
        onValueChange={(value) => {
          register("customerId").onChange({
            target: { value },
          });
          onCustomerSelect?.(value);
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select customer" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <div className="px-3 py-2">
              <SearchInput
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => {
                  console.log("Search term changed:", e.target.value);
                  setSearchTerm(e.target.value);
                }}
                className="mb-2"
              />
              {!isLoading && !error && filteredCustomers.length === 0 && (
                <Button
                  variant="outline"
                  onClick={handleCreateNewCustomer}
                  className="w-full"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create New Customer
                </Button>
              )}
            </div>
            {isLoading ? (
              <SelectItem value="loading" disabled>
                Loading customers...
              </SelectItem>
            ) : error ? (
              <SelectItem value="error" disabled>
                Error loading customers
              </SelectItem>
            ) : filteredCustomers.length === 0 ? (
              <SelectItem value="no-customers" disabled>
                {searchTerm ? `No customers found matching "${searchTerm}"` : "No customers available"}
              </SelectItem>
            ) : (
              filteredCustomers.map((customer) => (
                <SelectItem 
                  key={customer.id} 
                  value={customer.id}
                >
                  <div className="flex flex-col">
                    <span>{customer.full_name}</span>
                    {customer.email && (
                      <span className="text-sm text-muted-foreground">
                        {customer.email}
                      </span>
                    )}
                    {customer.phone_number && (
                      <span className="text-sm text-muted-foreground">
                        {customer.phone_number}
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))
            )}
          </SelectGroup>
        </SelectContent>
      </Select>
      {error && (
        <p className="text-sm text-red-500">
          Error loading customers. Please try again.
        </p>
      )}

      <CreateCustomerDialog 
        open={showCreateCustomer} 
        onOpenChange={setShowCreateCustomer}
      />
    </div>
  );
};
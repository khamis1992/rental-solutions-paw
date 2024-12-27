import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { CreateCustomerDialog } from "@/components/customers/CreateCustomerDialog";

interface CustomerSelectProps {
  register: any;
  onCustomerSelect: (customerId: string) => void;
}

export const CustomerSelect = ({ register, onCustomerSelect }: CustomerSelectProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateCustomer, setShowCreateCustomer] = useState(false);

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
          `phone_number.ilike.%${searchTerm}%,` +
          `driver_license.ilike.%${searchTerm}%`
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

  return (
    <div className="space-y-2">
      <Label htmlFor="customerId">Customer</Label>
      <Select 
        {...register("customerId")}
        onValueChange={(value) => {
          register("customerId").onChange({
            target: { value },
          });
          onCustomerSelect(value);
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select customer" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <div className="px-3 py-2">
              <Input
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => {
                  console.log("Search term changed:", e.target.value);
                  setSearchTerm(e.target.value);
                }}
                className="mb-2"
              />
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
              <>
                <SelectItem value="no-customers" disabled>
                  {searchTerm ? `No customers found matching "${searchTerm}"` : "No customers available"}
                </SelectItem>
                <div className="p-2 text-center">
                  <button
                    type="button"
                    onClick={() => setShowCreateCustomer(true)}
                    className="text-sm text-blue-500 hover:text-blue-700"
                  >
                    Create New Customer
                  </button>
                </div>
              </>
            ) : (
              filteredCustomers.map((customer) => (
                <SelectItem 
                  key={customer.id} 
                  value={customer.id}
                >
                  {customer.full_name} {customer.phone_number ? `(${customer.phone_number})` : ''}
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
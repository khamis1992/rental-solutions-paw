import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CustomerSelectProps } from "./types/customerSelect.types";

export const CustomerSelect = ({ register, onCustomerSelect }: CustomerSelectProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: customers = [], isLoading, error } = useQuery({
    queryKey: ["customers", searchTerm],
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

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching customers:", error);
        throw error;
      }

      return data || [];
    },
  });

  const filteredCustomers = customers || [];

  const handleCustomerSelect = (value: string) => {
    console.log("Selected customer ID:", value);
    register("customerId").onChange({ target: { value } });
    if (onCustomerSelect) {
      onCustomerSelect(value);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="customerId">Customer</Label>
      <Select onValueChange={handleCustomerSelect}>
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
    </div>
  );
};
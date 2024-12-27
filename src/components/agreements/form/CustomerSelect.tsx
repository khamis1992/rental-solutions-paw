import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EnhancedSelect } from "@/components/ui/enhanced-select";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { CreateCustomerDialog } from "@/components/customers/CreateCustomerDialog";

interface CustomerSelectProps {
  register: any;
  onCustomerSelect: (customerId: string) => void;
}

export const CustomerSelect = ({ register, onCustomerSelect }: CustomerSelectProps) => {
  const [showCreateCustomer, setShowCreateCustomer] = useState(false);

  const { data: customers = [], isLoading, error } = useQuery({
    queryKey: ["available-customers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "customer")
        .order("full_name", { ascending: true });

      if (error) {
        console.error("Error fetching customers:", error);
        throw error;
      }

      return data;
    },
  });

  const customerOptions = customers.map((customer) => ({
    value: customer.id,
    label: customer.full_name || "Unnamed Customer",
    description: customer.phone_number ? `Phone: ${customer.phone_number}` : undefined,
  }));

  return (
    <div className="space-y-2">
      <Label htmlFor="customerId">Customer</Label>
      <EnhancedSelect
        options={customerOptions}
        placeholder="Select customer"
        searchPlaceholder="Search customers..."
        loading={isLoading}
        error={error ? "Error loading customers. Please try again." : undefined}
        onValueChange={(value) => {
          register("customerId").onChange({
            target: { value },
          });
          onCustomerSelect(value);
        }}
        createNew={{
          label: "Create New Customer",
          onClick: () => setShowCreateCustomer(true),
        }}
      />

      <CreateCustomerDialog 
        open={showCreateCustomer} 
        onOpenChange={setShowCreateCustomer}
      />
    </div>
  );
};
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { UseFormRegister } from "react-hook-form";
import { AgreementFormData } from "../hooks/useAgreementForm";

interface CustomerSelectProps {
  register: UseFormRegister<AgreementFormData>;
  onCustomerSelect?: (customerId: string) => void;
}

export const CustomerSelect = ({ register, onCustomerSelect }: CustomerSelectProps) => {
  const { data: customers, isLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "customer");

      if (error) {
        console.error("Error fetching customers:", error);
        throw error;
      }

      return data;
    },
  });

  if (isLoading) {
    return <div>Loading customers...</div>;
  }

  const filteredCustomers = customers || [];

  const handleCustomerSelect = (value: string) => {
    console.log("Selected customer ID:", value);
    const event = {
      target: { value, name: "customerId" }
    };
    register("customerId").onChange(event);
    if (onCustomerSelect) {
      onCustomerSelect(value);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="customerId">Customer</Label>
      <Select 
        defaultValue=""
        {...register("customerId", { required: true })}
        onValueChange={handleCustomerSelect}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select customer" />
        </SelectTrigger>
        <SelectContent>
          {filteredCustomers.map((customer) => (
            <SelectItem key={customer.id} value={customer.id}>
              {customer.full_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
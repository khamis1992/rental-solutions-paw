import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/utils";

interface ContractFormData {
  contract_name: string;
  total_installments: number;
  monthly_installment: number;
  total_car_value: number;
  total_contract_value: number;
}

export function CreateContractDialog() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { register, handleSubmit, watch, setValue } = useForm<ContractFormData>();

  const watchMonthlyInstallment = watch("monthly_installment", 0);
  const watchTotalInstallments = watch("total_installments", 0);

  const calculateValues = (monthlyInstallment: number, totalInstallments: number) => {
    const totalCarValue = monthlyInstallment * totalInstallments;
    const totalContractValue = totalCarValue; // In this case they're the same
    
    setValue("total_car_value", totalCarValue);
    setValue("total_contract_value", totalContractValue);
  };

  const onSubmit = async (data: ContractFormData) => {
    try {
      const { error } = await supabase
        .from("car_installment_contracts")
        .insert({
          car_type: data.contract_name, // Using car_type field for contract name
          total_installments: data.total_installments,
          price_per_car: data.total_car_value,
          total_contract_value: data.total_contract_value,
          remaining_installments: data.total_installments,
          installment_value: data.monthly_installment,
          amount_pending: data.total_contract_value,
          category: 'standard', // Default category
          model_year: new Date().getFullYear(), // Current year as default
        });

      if (error) throw error;

      toast.success("Contract created successfully");
      queryClient.invalidateQueries({ queryKey: ["car-installment-contracts"] });
      setOpen(false);
    } catch (error) {
      console.error("Error creating contract:", error);
      toast.error("Failed to create contract");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Contract
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Contract</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contract_name">Contract Name</Label>
            <Input 
              id="contract_name" 
              {...register("contract_name", { required: true })} 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="total_installments">Total Installments</Label>
            <Input 
              id="total_installments" 
              type="number" 
              {...register("total_installments", { 
                required: true,
                valueAsNumber: true,
                onChange: (e) => calculateValues(watchMonthlyInstallment, Number(e.target.value))
              })} 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="monthly_installment">Monthly Installment (QAR)</Label>
            <Input 
              id="monthly_installment" 
              type="number" 
              {...register("monthly_installment", { 
                required: true,
                valueAsNumber: true,
                onChange: (e) => calculateValues(Number(e.target.value), watchTotalInstallments)
              })} 
            />
          </div>
          
          <div className="space-y-2">
            <Label>Total Car Value (QAR)</Label>
            <Input 
              type="number" 
              {...register("total_car_value")} 
              readOnly 
              className="bg-muted"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Total Contract Value (QAR)</Label>
            <Input 
              type="number" 
              {...register("total_contract_value")} 
              readOnly 
              className="bg-muted"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Contract</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
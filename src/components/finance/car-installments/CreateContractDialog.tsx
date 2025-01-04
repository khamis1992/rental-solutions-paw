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

interface ContractFormData {
  car_type: string;
  category: string;
  model_year: number;
  price_per_car: number;
  total_contract_value: number;
  total_installments: number;
  installment_value: number;
}

export function CreateContractDialog() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { register, handleSubmit, watch, setValue } = useForm<ContractFormData>();

  const watchPricePerCar = watch("price_per_car", 0);
  const watchTotalInstallments = watch("total_installments", 0);

  const calculateValues = (pricePerCar: number, totalInstallments: number) => {
    const totalValue = pricePerCar;
    const installmentValue = totalInstallments > 0 ? totalValue / totalInstallments : 0;
    setValue("total_contract_value", totalValue);
    setValue("installment_value", installmentValue);
  };

  const onSubmit = async (data: ContractFormData) => {
    try {
      const { error } = await supabase
        .from("car_installment_contracts")
        .insert({
          car_type: data.car_type,
          category: data.category,
          model_year: data.model_year,
          price_per_car: data.price_per_car,
          total_contract_value: data.total_contract_value,
          total_installments: data.total_installments,
          remaining_installments: data.total_installments,
          installment_value: data.installment_value,
          amount_pending: data.total_contract_value,
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
            <Label htmlFor="car_type">Car Type</Label>
            <Input id="car_type" {...register("car_type", { required: true })} />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input id="category" {...register("category", { required: true })} />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="model_year">Model Year</Label>
            <Input 
              id="model_year" 
              type="number" 
              {...register("model_year", { 
                required: true,
                valueAsNumber: true 
              })} 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="price_per_car">Price per Car (QAR)</Label>
            <Input 
              id="price_per_car" 
              type="number" 
              {...register("price_per_car", { 
                required: true,
                valueAsNumber: true,
                onChange: (e) => calculateValues(Number(e.target.value), watchTotalInstallments)
              })} 
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
                onChange: (e) => calculateValues(watchPricePerCar, Number(e.target.value))
              })} 
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
          
          <div className="space-y-2">
            <Label>Installment Value (QAR)</Label>
            <Input 
              type="number" 
              {...register("installment_value")} 
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
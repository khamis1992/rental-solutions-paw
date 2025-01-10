import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface PaymentFormProps {
  agreementId?: string;
}

export const PaymentForm = ({ agreementId }: PaymentFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, setValue } = useForm();

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("new_unified_payments").insert({
        lease_id: agreementId,
        amount: parseFloat(data.amount),
        amount_paid: parseFloat(data.amount),
        balance: 0,
        payment_method: data.paymentMethod,
        description: data.description,
        payment_date: new Date().toISOString(),
        status: 'completed',
        type: 'Income'
      });

      if (error) throw error;

      toast.success("Payment added successfully");
      reset();
      
      // Invalidate relevant queries to refresh the data
      await queryClient.invalidateQueries({ queryKey: ['payment-history'] });
      await queryClient.invalidateQueries({ queryKey: ['financial-metrics'] });
      
    } catch (error) {
      console.error("Error adding payment:", error);
      toast.error("Failed to add payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="amount">Amount (QAR)</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          {...register("amount", { required: true })}
        />
      </div>
      
      <div>
        <Label htmlFor="paymentMethod">Payment Method</Label>
        <Select onValueChange={(value) => setValue("paymentMethod", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select payment method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Cash">Cash</SelectItem>
            <SelectItem value="WireTransfer">Wire Transfer</SelectItem>
            <SelectItem value="Invoice">Invoice</SelectItem>
            <SelectItem value="On_hold">On Hold</SelectItem>
            <SelectItem value="Deposit">Deposit</SelectItem>
            <SelectItem value="Cheque">Cheque</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Add payment notes or description..."
          {...register("description")}
        />
      </div>

      <Button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? "Adding Payment..." : "Add Payment"}
      </Button>
    </form>
  );
};
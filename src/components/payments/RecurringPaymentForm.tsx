import { useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface RecurringPaymentFormProps {
  onSuccess: () => void;
}

export function RecurringPaymentForm({ onSuccess }: RecurringPaymentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const { register, handleSubmit, watch, setValue } = useForm();

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const interval = `${data.intervalValue} ${data.intervalUnit}`;
      const nextPaymentDate = new Date();
      
      if (data.intervalUnit === 'days') {
        nextPaymentDate.setDate(nextPaymentDate.getDate() + parseInt(data.intervalValue));
      } else if (data.intervalUnit === 'months') {
        nextPaymentDate.setMonth(nextPaymentDate.getMonth() + parseInt(data.intervalValue));
      }

      const { error } = await supabase.from("payments").insert({
        lease_id: data.leaseId,
        amount: data.amount,
        payment_method: data.paymentMethod,
        status: "pending",
        is_recurring: true,
        recurring_interval: interval,
        next_payment_date: nextPaymentDate.toISOString(),
      });

      if (error) throw error;

      toast.success("Recurring payment set up successfully");
      queryClient.invalidateQueries({ queryKey: ["recurring-payments"] });
      onSuccess();
    } catch (error) {
      console.error("Error setting up recurring payment:", error);
      toast.error("Failed to set up recurring payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="leaseId">Agreement</Label>
        <Select onValueChange={(value) => setValue("leaseId", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select agreement" />
          </SelectTrigger>
          <SelectContent>
            {/* We'll need to fetch and populate agreements here */}
            <SelectItem value="agreement1">Agreement #1</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Amount (QAR)</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          {...register("amount", { required: true })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="intervalValue">Repeat Every</Label>
          <Input
            id="intervalValue"
            type="number"
            min="1"
            {...register("intervalValue", { required: true })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="intervalUnit">Unit</Label>
          <Select onValueChange={(value) => setValue("intervalUnit", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select unit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="days">Days</SelectItem>
              <SelectItem value="months">Months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="paymentMethod">Payment Method</Label>
        <Select onValueChange={(value) => setValue("paymentMethod", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select payment method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cash">Cash</SelectItem>
            <SelectItem value="wire_transfer">Wire Transfer</SelectItem>
            <SelectItem value="invoice">Invoice</SelectItem>
            <SelectItem value="cheque">Cheque</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Setting up..." : "Set Up Recurring Payment"}
      </Button>
    </form>
  );
}
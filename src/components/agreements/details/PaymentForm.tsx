import { useState } from "react";
import { useForm } from "react-hook-form";
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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PaymentFormProps {
  agreementId: string;
}

export const PaymentForm = ({ agreementId }: PaymentFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("payments").insert({
        lease_id: agreementId,
        amount: data.amount,
        payment_method: data.paymentMethod,
        payment_date: new Date().toISOString(),
      });

      if (error) throw error;

      toast.success("Payment added successfully");
      reset();
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
        <Select {...register("paymentMethod", { required: true })}>
          <SelectTrigger>
            <SelectValue placeholder="Select payment method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cash">Cash</SelectItem>
            <SelectItem value="wire_transfer">Wire Transfer</SelectItem>
            <SelectItem value="invoice">Invoice</SelectItem>
            <SelectItem value="on_hold">On Hold</SelectItem>
            <SelectItem value="deposit">Deposit</SelectItem>
            <SelectItem value="cheque">Cheque</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Adding Payment..." : "Add Payment"}
      </Button>
    </form>
  );
};
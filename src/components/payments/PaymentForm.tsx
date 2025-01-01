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

interface PaymentFormProps {
  agreementId?: string; // Made optional with ?
}

export const PaymentForm = ({ agreementId }: PaymentFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("payments").insert({
        lease_id: agreementId, // This will be null if no agreementId is provided
        amount: data.amount,
        payment_method: data.paymentMethod,
        description: data.description,
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" aria-label="Payment form">
      <div>
        <Label htmlFor="amount">Amount (QAR)</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          {...register("amount", { required: true })}
          aria-required="true"
          aria-invalid={false}
        />
      </div>
      <div>
        <Label htmlFor="paymentMethod">Payment Method</Label>
        <Select {...register("paymentMethod", { required: true })} aria-required="true">
          <SelectTrigger aria-label="Select payment method">
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
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Add payment notes or description..."
          {...register("description")}
          aria-label="Payment description"
        />
      </div>
      <Button 
        type="submit" 
        disabled={isSubmitting}
        aria-label={isSubmitting ? "Adding payment..." : "Add payment"}
      >
        {isSubmitting ? "Adding Payment..." : "Add Payment"}
      </Button>
    </form>
  );
};
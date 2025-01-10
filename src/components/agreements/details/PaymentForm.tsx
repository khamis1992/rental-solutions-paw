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
import { PaymentMethodType, PaymentFormData } from "@/types/database/payment.types";
import { isValidDateFormat } from "@/lib/dateUtils";

interface PaymentFormProps {
  agreementId: string;
}

export const PaymentForm = ({ agreementId }: PaymentFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<PaymentFormData>();

  const onSubmit = async (data: PaymentFormData) => {
    setIsSubmitting(true);
    try {
      // Validate payment date format if provided
      if (data.paymentDate && !isValidDateFormat(data.paymentDate)) {
        toast.error("Invalid date format. Please use DD/MM/YYYY");
        return;
      }

      const { error } = await supabase.from("new_unified_payments").insert({
        lease_id: agreementId,
        amount: parseFloat(data.amount.toString()),
        amount_paid: parseFloat(data.amountPaid.toString()),
        balance: 0,
        payment_method: data.paymentMethod,
        description: data.description,
        payment_date: data.paymentDate || new Date().toISOString(),
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
        <Label htmlFor="amountPaid">Amount Paid (QAR)</Label>
        <Input
          id="amountPaid"
          type="number"
          step="0.01"
          {...register("amountPaid", { required: true })}
        />
      </div>

      <div>
        <Label htmlFor="paymentDate">Payment Date (DD/MM/YYYY)</Label>
        <Input
          id="paymentDate"
          type="text"
          placeholder="DD/MM/YYYY"
          {...register("paymentDate", {
            validate: (value) => 
              !value || isValidDateFormat(value) || "Please use DD/MM/YYYY format"
          })}
        />
        {errors.paymentDate && (
          <p className="text-sm text-red-500 mt-1">{errors.paymentDate.message}</p>
        )}
      </div>
      
      <div>
        <Label htmlFor="paymentMethod">Payment Method</Label>
        <Select onValueChange={(value) => setValue("paymentMethod", value as PaymentMethodType)}>
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
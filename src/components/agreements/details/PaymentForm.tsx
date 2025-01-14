import { useState, useEffect } from "react";
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
import { formatCurrency } from "@/lib/utils";

interface PaymentFormProps {
  agreementId: string;
}

export const PaymentForm = ({ agreementId }: PaymentFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lateFee, setLateFee] = useState(0);
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, setValue, watch } = useForm();

  // Calculate late fee based on current date
  useEffect(() => {
    const calculateLateFee = () => {
      const today = new Date();
      const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      
      // If today is after the 1st of the month
      if (today > firstOfMonth) {
        const daysLate = Math.floor((today.getTime() - firstOfMonth.getTime()) / (1000 * 60 * 60 * 24));
        setLateFee(daysLate * 120); // 120 QAR per day
      } else {
        setLateFee(0);
      }
    };

    calculateLateFee();
  }, []);

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const totalAmount = parseFloat(data.amount) + lateFee;
      const paymentAmount = parseFloat(data.amount);

      const { error } = await supabase.from("unified_payments").insert({
        lease_id: agreementId,
        amount: totalAmount,
        amount_paid: paymentAmount, // Store the actual payment amount without late fee
        balance: lateFee, // Any remaining balance (late fees)
        payment_method: data.paymentMethod,
        description: data.description,
        payment_date: new Date().toISOString(),
        status: 'completed',
        type: 'Income',
        late_fine_amount: lateFee,
        days_overdue: lateFee > 0 ? Math.floor(lateFee / 120) : 0,
        reconciliation_status: 'pending'
      });

      if (error) throw error;

      toast.success("Payment added successfully");
      reset();
      
      // Invalidate relevant queries to refresh the data
      await queryClient.invalidateQueries({ queryKey: ['unified-payments'] });
      await queryClient.invalidateQueries({ queryKey: ['payment-history'] });
      
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
      
      {lateFee > 0 && (
        <div className="text-sm text-red-600 font-medium">
          Late Fee: {formatCurrency(lateFee)}
        </div>
      )}
      
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
        {isSubmitting ? "Adding Payment..." : `Add Payment ${lateFee > 0 ? `(Including ${formatCurrency(lateFee)} Late Fee)` : ''}`}
      </Button>
    </form>
  );
};
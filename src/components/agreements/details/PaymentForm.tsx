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
  const [rentAmount, setRentAmount] = useState(0);
  const [dueAmount, setDueAmount] = useState(0);
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, setValue } = useForm();

  // Fetch rent amount and calculate late fee
  useEffect(() => {
    const fetchRentAmount = async () => {
      const { data: lease } = await supabase
        .from('leases')
        .select('rent_amount')
        .eq('id', agreementId)
        .maybeSingle();
      
      if (lease?.rent_amount) {
        setRentAmount(Number(lease.rent_amount));
      }
    };

    const calculateLateFee = () => {
      const today = new Date();
      const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      
      if (today > firstOfMonth) {
        const daysLate = Math.floor((today.getTime() - firstOfMonth.getTime()) / (1000 * 60 * 60 * 24));
        setLateFee(daysLate * 120); // 120 QAR per day
      } else {
        setLateFee(0);
      }
    };

    fetchRentAmount();
    calculateLateFee();
  }, [agreementId]);

  // Update due amount when rent amount or late fee changes
  useEffect(() => {
    setDueAmount(rentAmount + lateFee);
  }, [rentAmount, lateFee]);

  const onSubmit = async (data: any) => {
    if (isSubmitting) return; // Prevent duplicate submissions
    
    setIsSubmitting(true);
    try {
      const paymentAmount = Number(data.amount);
      const balance = dueAmount - paymentAmount;

      const { error } = await supabase.from("unified_payments").insert({
        lease_id: agreementId,
        amount: dueAmount,
        amount_paid: paymentAmount,
        balance: balance,
        payment_method: data.paymentMethod,
        description: data.description,
        payment_date: new Date().toISOString(),
        status: 'completed',
        type: 'Income',
        late_fine_amount: lateFee,
        days_overdue: Math.floor(lateFee / 120)
      });

      if (error) throw error;

      toast.success("Payment added successfully");
      reset();
      
      // Invalidate relevant queries
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
      <div className="bg-muted p-4 rounded-lg mb-4">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Due Amount</div>
            <div className="text-lg font-semibold">
              {formatCurrency(dueAmount)}
              <span className="text-sm text-muted-foreground ml-2">
                (Rent: {formatCurrency(rentAmount)} + Late Fee: {formatCurrency(lateFee)})
              </span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="amount">Amount Paid (QAR)</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          min="0"
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
import { useState, useEffect } from "react";
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
import { useQueryClient } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface PaymentFormProps {
  agreementId: string;
}

export const PaymentForm = ({ agreementId }: PaymentFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lateFee, setLateFee] = useState(0);
  const [balance, setBalance] = useState(0);
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, setValue, watch } = useForm();
  const amountWatch = watch("amount", 0);

  // Calculate late fee based on current date
  useEffect(() => {
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

    calculateLateFee();
  }, []);

  // Fetch current balance and update when amount changes
  useEffect(() => {
    const fetchBalance = async () => {
      const { data: agreement } = await supabase
        .from('leases')
        .select(`
          total_amount,
          unified_payments (
            amount_paid,
            late_fine_amount
          )
        `)
        .eq('id', agreementId)
        .maybeSingle();

      if (agreement) {
        const totalPaid = agreement.unified_payments?.reduce((sum, payment) => 
          sum + (payment.amount_paid || 0) - (payment.late_fine_amount || 0), 0) || 0;
        const totalLateFines = agreement.unified_payments?.reduce((sum, payment) => 
          sum + (payment.late_fine_amount || 0), 0) || 0;
        
        const currentBalance = (agreement.total_amount + totalLateFines + lateFee) - 
          (totalPaid + parseFloat(amountWatch || 0));
        
        setBalance(currentBalance);
      }
    };

    fetchBalance();
  }, [agreementId, amountWatch, lateFee]);

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const amountPaid = parseFloat(data.amount);
      const totalAmount = amountPaid + lateFee;

      const { error } = await supabase.from("unified_payments").insert({
        lease_id: agreementId,
        amount: totalAmount,
        amount_paid: amountPaid, // Store only the actual amount paid
        balance: balance, // Store the calculated balance
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
      await queryClient.invalidateQueries({ queryKey: ['payment-history'] });
      reset();
    } catch (error) {
      console.error('Error adding payment:', error);
      toast.error('Failed to add payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

      <Card className="p-4 space-y-2">
        {lateFee > 0 && (
          <div className="flex justify-between text-sm">
            <span>Late Fee:</span>
            <span className="text-red-600 font-medium">{formatCurrency(lateFee)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm font-medium">
          <span>Balance Due:</span>
          <span className={balance > 0 ? "text-red-600" : "text-green-600"}>
            {formatCurrency(balance)}
          </span>
        </div>
      </Card>
      
      <div>
        <Label htmlFor="paymentMethod">Payment Method</Label>
        <Select onValueChange={(value) => setValue("paymentMethod", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select payment method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Cash">Cash</SelectItem>
            <SelectItem value="Card">Card</SelectItem>
            <SelectItem value="Bank_Transfer">Bank Transfer</SelectItem>
            <SelectItem value="Cheque">Cheque</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          {...register("description")}
          placeholder="Payment description"
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
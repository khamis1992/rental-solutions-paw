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
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PaymentMethodType, PaymentStatus } from "@/types/database/agreement.types";

interface PaymentFormProps {
  agreementId: string;
}

export const PaymentForm = ({ agreementId }: PaymentFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const paymentData = {
        lease_id: agreementId,
        amount: data.amount,
        payment_method: data.paymentMethod as PaymentMethodType,
        description: data.description,
        payment_date: new Date().toISOString(),
        is_recurring: isRecurring,
        recurring_interval: isRecurring ? `${data.intervalValue} ${data.intervalUnit}` : null,
        next_payment_date: isRecurring ? 
          new Date(Date.now() + getIntervalInMilliseconds(data.intervalValue, data.intervalUnit)).toISOString() : 
          null,
        status: 'pending' as PaymentStatus
      };

      const { error } = await supabase.from("payments").insert(paymentData);

      if (error) throw error;

      toast.success("Payment added successfully");
      reset();
      setIsRecurring(false);
    } catch (error) {
      console.error("Error adding payment:", error);
      toast.error("Failed to add payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getIntervalInMilliseconds = (value: number, unit: string) => {
    const milliseconds = {
      days: 24 * 60 * 60 * 1000,
      weeks: 7 * 24 * 60 * 60 * 1000,
      months: 30 * 24 * 60 * 60 * 1000
    };
    return value * milliseconds[unit as keyof typeof milliseconds];
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
          aria-required="true"
        />
      </div>
      
      <div>
        <Label htmlFor="paymentMethod">Payment Method</Label>
        <Select {...register("paymentMethod", { required: true })}>
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

      <div className="flex items-center space-x-2">
        <Switch
          id="recurring"
          checked={isRecurring}
          onCheckedChange={setIsRecurring}
          aria-label="Enable recurring payments"
        />
        <Label htmlFor="recurring">Recurring Payment</Label>
      </div>

      {isRecurring && (
        <div className="flex space-x-4">
          <div className="flex-1">
            <Label htmlFor="intervalValue">Repeat Every</Label>
            <Input
              id="intervalValue"
              type="number"
              min="1"
              {...register("intervalValue", { required: isRecurring })}
              aria-label="Interval value"
            />
          </div>
          <div className="flex-1">
            <Label htmlFor="intervalUnit">Unit</Label>
            <Select {...register("intervalUnit", { required: isRecurring })}>
              <SelectTrigger>
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="days">Days</SelectItem>
                <SelectItem value="weeks">Weeks</SelectItem>
                <SelectItem value="months">Months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

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
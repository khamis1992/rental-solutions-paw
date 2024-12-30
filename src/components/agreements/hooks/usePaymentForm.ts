import { useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface PaymentFormData {
  amount: number;
  paymentMethod: string;
  description?: string;
  isRecurring?: boolean;
  intervalValue?: number;
  intervalUnit?: 'days' | 'weeks' | 'months';
}

export const usePaymentForm = (agreementId: string) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const queryClient = useQueryClient();
  
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<PaymentFormData>();

  const onSubmit = async (data: PaymentFormData) => {
    setIsSubmitting(true);
    try {
      const paymentData = {
        lease_id: agreementId,
        amount: Number(data.amount),
        payment_method: data.paymentMethod,
        description: data.description,
        payment_date: new Date().toISOString(),
        status: 'pending' as const,
        type: 'Income', // Set default type as Income
        is_recurring: isRecurring,
        recurring_interval: isRecurring ? 
          `${data.intervalValue} ${data.intervalUnit}` : null,
        next_payment_date: isRecurring ? 
          new Date(Date.now() + getIntervalInMilliseconds(data.intervalValue!, data.intervalUnit!)).toISOString() : 
          null
      };

      console.log('Submitting payment:', paymentData);
      const { error } = await supabase
        .from("payments")
        .insert(paymentData);

      if (error) throw error;
      
      // Invalidate and refetch relevant queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['payment-history', agreementId] }),
        queryClient.invalidateQueries({ queryKey: ['payment-schedules', agreementId] }),
        queryClient.invalidateQueries({ queryKey: ['agreement-details', agreementId] }),
        queryClient.invalidateQueries({ queryKey: ['agreements'] })
      ]);
      
      toast.success("Payment added successfully");
      reset();
      setIsRecurring(false);
    } catch (error: any) {
      console.error("Error adding payment:", error);
      toast.error(error.message || "Failed to add payment. Please try again.");
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

  return {
    register,
    control,
    handleSubmit,
    onSubmit,
    isRecurring,
    setIsRecurring,
    errors,
    isSubmitting
  };
};
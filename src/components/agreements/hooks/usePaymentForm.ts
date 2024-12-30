import { useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { PaymentMethodType } from "@/types/database/payment.types";
import { addMonths, startOfMonth } from "date-fns";

interface PaymentFormData {
  amount: number;
  paymentMethod: PaymentMethodType;
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

  const calculateNextPaymentDate = () => {
    // Get the first day of next month
    const nextMonth = addMonths(new Date(), 1);
    return startOfMonth(nextMonth).toISOString();
  };

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
        type: 'Income',
        is_recurring: isRecurring,
        recurring_interval: isRecurring ? 
          `${data.intervalValue} ${data.intervalUnit}` : null,
        next_payment_date: isRecurring ? calculateNextPaymentDate() : null
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
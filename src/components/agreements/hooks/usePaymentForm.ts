import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { PaymentMethodType } from "@/types/database/payment.types";
import { addMonths, startOfMonth, differenceInDays } from "date-fns";

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
  const [lateFineAmount, setLateFineAmount] = useState(0);
  const [daysOverdue, setDaysOverdue] = useState(0);
  const [baseAmount, setBaseAmount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const queryClient = useQueryClient();
  
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<PaymentFormData>();

  const calculateNextPaymentDate = () => {
    const nextMonth = addMonths(new Date(), 1);
    return startOfMonth(nextMonth).toISOString();
  };

  const calculateLateFine = useCallback(async () => {
    try {
      // Get agreement details to check daily late fine amount
      const { data: agreement } = await supabase
        .from('leases')
        .select('rent_amount, daily_late_fine')
        .eq('id', agreementId)
        .single();

      if (agreement) {
        const today = new Date();
        const firstOfMonth = startOfMonth(today);
        const overdueDays = Math.max(0, differenceInDays(today, firstOfMonth));
        
        setDaysOverdue(overdueDays);
        setBaseAmount(agreement.rent_amount);
        
        if (overdueDays > 0) {
          const fineAmount = overdueDays * (agreement.daily_late_fine || 120);
          setLateFineAmount(fineAmount);
          setTotalAmount(agreement.rent_amount + fineAmount);
        } else {
          setLateFineAmount(0);
          setTotalAmount(agreement.rent_amount);
        }
      }
    } catch (error) {
      console.error('Error calculating late fine:', error);
      toast.error('Error calculating late fine');
    }
  }, [agreementId]);

  useEffect(() => {
    calculateLateFine();
  }, [calculateLateFine]);

  const onSubmit = async (data: PaymentFormData) => {
    setIsSubmitting(true);
    try {
      const paymentData = {
        lease_id: agreementId,
        amount: totalAmount,
        payment_method: data.paymentMethod,
        description: data.description,
        payment_date: new Date().toISOString(),
        status: 'pending' as const,
        type: 'Income',
        is_recurring: isRecurring,
        recurring_interval: isRecurring ? 
          `${data.intervalValue} ${data.intervalUnit}` : null,
        next_payment_date: calculateNextPaymentDate(),
        late_fine_amount: lateFineAmount,
        days_overdue: daysOverdue
      };

      const { error } = await supabase
        .from("payments")
        .insert(paymentData);

      if (error) throw error;
      
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
    isSubmitting,
    lateFineAmount,
    daysOverdue,
    baseAmount,
    totalAmount,
    calculateLateFine
  };
};
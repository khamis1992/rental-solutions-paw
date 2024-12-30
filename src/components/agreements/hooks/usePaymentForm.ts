import { useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const usePaymentForm = (agreementId: string) => {
  const [isRecurring, setIsRecurring] = useState(false);
  const [baseAmount, setBaseAmount] = useState(0);
  const [lateFineAmount, setLateFineAmount] = useState(0);
  const [daysOverdue, setDaysOverdue] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const queryClient = useQueryClient();

  const { data: agreement } = useQuery({
    queryKey: ['agreement-details', agreementId],
    queryFn: async () => {
      const { data: agreement, error } = await supabase
        .from('leases')
        .select(`
          *,
          remainingAmount:remaining_amounts!remaining_amounts_lease_id_fkey (
            rent_amount
          )
        `)
        .eq('id', agreementId)
        .single();

      if (error) throw error;
      return agreement;
    },
  });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      amount: 0,
      paymentMethod: "",
      description: "",
      isRecurring: false,
      recurringInterval: "",
    },
  });

  // Set base amount when agreement data is loaded
  useEffect(() => {
    if (agreement?.remainingAmount?.rent_amount) {
      setBaseAmount(agreement.remainingAmount.rent_amount);
      setValue("amount", agreement.remainingAmount.rent_amount);
    }
  }, [agreement, setValue]);

  const calculateLateFine = useCallback(async () => {
    if (!agreementId) return;

    try {
      const { data: leaseData, error: leaseError } = await supabase
        .from('leases')
        .select('daily_late_fine, late_fine_start_day, rent_due_day')
        .eq('id', agreementId)
        .single();

      if (leaseError) throw leaseError;

      const today = new Date();
      const dueDay = leaseData.rent_due_day || 1;
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      
      // Create due date for current month
      const dueDate = new Date(currentYear, currentMonth, dueDay);
      
      // If today is past the due date
      if (today > dueDate) {
        const diffTime = Math.abs(today.getTime() - dueDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        // Only start counting after late_fine_start_day
        const effectiveLateDays = Math.max(0, diffDays - (leaseData.late_fine_start_day - 1));
        
        if (effectiveLateDays > 0) {
          const fineAmount = effectiveLateDays * (leaseData.daily_late_fine || 0);
          setLateFineAmount(fineAmount);
          setDaysOverdue(effectiveLateDays);
          setTotalAmount(baseAmount + fineAmount);
        } else {
          setLateFineAmount(0);
          setDaysOverdue(0);
          setTotalAmount(baseAmount);
        }
      } else {
        setLateFineAmount(0);
        setDaysOverdue(0);
        setTotalAmount(baseAmount);
      }
    } catch (error) {
      console.error('Error calculating late fine:', error);
      toast.error('Failed to calculate late fine');
    }
  }, [agreementId, baseAmount]);

  const onSubmit = async (data: any) => {
    try {
      const { error } = await supabase.from("payments").insert([
        {
          lease_id: agreementId,
          amount: totalAmount,
          payment_method: data.paymentMethod,
          status: "completed",
          payment_date: new Date().toISOString(),
          description: data.description,
          is_recurring: isRecurring,
          recurring_interval: isRecurring ? data.recurringInterval : null,
          type: "Income",
          late_fine_amount: lateFineAmount,
          days_overdue: daysOverdue,
        },
      ]);

      if (error) throw error;

      toast.success("Payment added successfully");
      reset();
      
      // Invalidate relevant queries
      await queryClient.invalidateQueries({ queryKey: ['payment-history'] });
      await queryClient.invalidateQueries({ queryKey: ['agreement-details'] });
      
    } catch (error) {
      console.error("Error adding payment:", error);
      toast.error("Failed to add payment");
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
    isSubmitting: false,
    lateFineAmount,
    daysOverdue,
    baseAmount,
    totalAmount,
    calculateLateFine,
    setBaseAmount
  };
};
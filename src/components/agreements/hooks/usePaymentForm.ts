import { useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

export const usePaymentForm = (agreementId: string) => {
  const [isRecurring, setIsRecurring] = useState(false);
  const [baseAmount, setBaseAmount] = useState(0);
  const [lateFineAmount, setLateFineAmount] = useState(0);
  const [daysOverdue, setDaysOverdue] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  const { data: agreement } = useQuery({
    queryKey: ['agreement-details', agreementId],
    queryFn: async () => {
      const { data: agreement, error } = await supabase
        .from('leases')
        .select(`
          *,
          remainingAmount:remaining_amounts!remaining_amounts_lease_id_fkey (
            rent_amount,
            final_price,
            remaining_amount
          )
        `)
        .eq('id', agreementId)
        .maybeSingle();

      if (error) throw error;
      return agreement;
    },
  });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      amount: 0,
      amountPaid: 0,
      paymentMethod: "",
      description: "",
      isRecurring: false,
      recurringInterval: "",
    },
  });

  // Initialize base amount when agreement data is loaded
  useEffect(() => {
    if (agreement?.rent_amount) {
      console.log('Setting base amount from agreement:', agreement.rent_amount);
      setBaseAmount(agreement.rent_amount);
      setValue("amount", agreement.rent_amount);
      setTotalAmount(agreement.rent_amount);
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
      
      const dueDate = new Date(currentYear, currentMonth, dueDay);
      
      if (today > dueDate) {
        const diffTime = Math.abs(today.getTime() - dueDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
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

  return {
    register,
    control,
    handleSubmit,
    errors,
    isSubmitting: false,
    lateFineAmount,
    daysOverdue,
    baseAmount,
    totalAmount,
    calculateLateFine,
    setBaseAmount,
    watch,
    setValue
  };
};
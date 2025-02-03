import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PaymentData {
  lease_id: string;
  amount: number;
  amount_paid: number;
  payment_date: string;
  payment_method: string;
  description?: string;
  type?: string;
}

export const usePaymentOperations = () => {
  const queryClient = useQueryClient();

  const checkDuplicatePayment = async (data: PaymentData) => {
    const startOfDay = new Date(data.payment_date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(data.payment_date);
    endOfDay.setHours(23, 59, 59, 999);

    const { data: existingPayments, error } = await supabase
      .from("unified_payments")
      .select("*")
      .eq("lease_id", data.lease_id)
      .eq("amount", data.amount)
      .gte("payment_date", startOfDay.toISOString())
      .lte("payment_date", endOfDay.toISOString());

    if (error) {
      console.error("Error checking duplicates:", error);
      return null;
    }

    return existingPayments?.[0] || null;
  };

  const addPayment = async (data: PaymentData) => {
    try {
      // Check for duplicate payment
      const duplicatePayment = await checkDuplicatePayment(data);

      if (duplicatePayment) {
        // Delete the duplicate payment
        const { error: deleteError } = await supabase
          .from("unified_payments")
          .delete()
          .eq("id", duplicatePayment.id);

        if (deleteError) throw deleteError;
        
        toast.info("Removed duplicate payment entry");
      }

      // Add the new payment
      const { data: newPayment, error } = await supabase
        .from("unified_payments")
        .insert({
          lease_id: data.lease_id,
          amount: data.amount,
          amount_paid: data.amount_paid,
          payment_date: data.payment_date,
          payment_method: data.payment_method,
          description: data.description,
          type: data.type || "Income",
          status: "completed",
          balance: 0
        })
        .select()
        .single();

      if (error) throw error;

      // Invalidate relevant queries
      await queryClient.invalidateQueries({ queryKey: ["payment-history"] });
      await queryClient.invalidateQueries({ queryKey: ["unified-payments"] });

      toast.success("Payment added successfully");
      return newPayment;
    } catch (error) {
      console.error("Error adding payment:", error);
      toast.error("Failed to add payment");
      throw error;
    }
  };

  return {
    addPayment,
    checkDuplicatePayment
  };
};
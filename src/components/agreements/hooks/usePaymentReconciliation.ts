import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export const usePaymentReconciliation = () => {
  const [isReconciling, setIsReconciling] = useState(false);
  const queryClient = useQueryClient();

  const reconcilePayments = async (agreementId: string) => {
    setIsReconciling(true);
    try {
      // Get all payments for this agreement
      const { data: payments, error: fetchError } = await supabase
        .from("unified_payments")
        .select("*")
        .eq("lease_id", agreementId)
        .eq("reconciliation_status", "pending");

      if (fetchError) throw fetchError;

      // Update each payment's reconciliation status
      for (const payment of payments || []) {
        const { error: updateError } = await supabase
          .from("unified_payments")
          .update({
            reconciliation_status: "completed",
            updated_at: new Date().toISOString()
          })
          .eq("id", payment.id);

        if (updateError) throw updateError;
      }

      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ["payment-history"] });
      await queryClient.invalidateQueries({ queryKey: ["payment-schedules"] });

    } catch (error) {
      console.error("Error reconciling payments:", error);
      throw error;
    } finally {
      setIsReconciling(false);
    }
  };

  return {
    isReconciling,
    reconcilePayments
  };
};
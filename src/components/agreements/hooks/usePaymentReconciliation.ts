import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export const usePaymentReconciliation = () => {
  const [isReconciling, setIsReconciling] = useState(false);
  const queryClient = useQueryClient();

  const reconcilePayments = async (agreementId: string) => {
    setIsReconciling(true);
    try {
      const { error } = await supabase.functions.invoke('process-payment-reconciliation', {
        body: { agreementId }
      });

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['unified-payments'] });
      await queryClient.invalidateQueries({ queryKey: ['agreement-details'] });
      toast.success('Payments reconciled successfully');
    } catch (error) {
      console.error('Error reconciling payments:', error);
      toast.error('Failed to reconcile payments');
    } finally {
      setIsReconciling(false);
    }
  };

  return {
    isReconciling,
    reconcilePayments
  };
};
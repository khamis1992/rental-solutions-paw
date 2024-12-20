import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const usePaymentReconciliation = () => {
  const [isReconciling, setIsReconciling] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const reconcilePayments = async (paymentId: string) => {
    setIsReconciling(true);
    try {
      const { data, error } = await supabase.functions.invoke('process-payment-reconciliation', {
        body: { paymentId }
      });

      if (error) throw error;

      // Invalidate all related queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["payment-history"] }),
        queryClient.invalidateQueries({ queryKey: ["payment-reconciliation"] }),
        queryClient.invalidateQueries({ queryKey: ["agreements"] }),
        queryClient.invalidateQueries({ queryKey: ["financial-reports"] })
      ]);

      toast({
        title: "Success",
        description: "Payment reconciliation completed successfully",
      });

      return data;
    } catch (error: any) {
      console.error('Reconciliation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to reconcile payment",
        variant: "destructive",
      });
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
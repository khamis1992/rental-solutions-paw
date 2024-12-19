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

      await queryClient.invalidateQueries({ queryKey: ["payment-history"] });
      await queryClient.invalidateQueries({ queryKey: ["payment-reconciliation"] });

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
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { toast } from "sonner";
import { PaymentHistoryView } from "@/types/database/payment.types";

export const PAYMENT_HISTORY_KEY = "payment-history";

export const usePaymentData = (agreementId: string) => {
  const queryClient = useQueryClient();

  const { data: payments, isLoading, error } = useQuery({
    queryKey: [PAYMENT_HISTORY_KEY, agreementId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("payment_history_view")
          .select("*")
          .eq("lease_id", agreementId)
          .order("actual_payment_date", { ascending: false });

        if (error) throw error;
        return data as PaymentHistoryView[];
      } catch (err) {
        console.error("Error fetching payment history:", err);
        throw err;
      }
    },
    enabled: !!agreementId,
  });

  useEffect(() => {
    if (!agreementId) return;

    // Single channel for all payment-related changes
    const channel = supabase
      .channel('payment-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'unified_payments',
          filter: `lease_id=eq.${agreementId}`
        },
        async (payload) => {
          console.log('Payment change detected:', payload);
          
          // Invalidate query to trigger refresh
          await queryClient.invalidateQueries({ 
            queryKey: [PAYMENT_HISTORY_KEY, agreementId] 
          });
          
          const eventMessages = {
            INSERT: 'New payment recorded',
            UPDATE: 'Payment updated',
            DELETE: 'Payment removed'
          };
          
          toast.info(
            eventMessages[payload.eventType as keyof typeof eventMessages] || 'Payment record changed'
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [agreementId, queryClient]);

  return {
    payments,
    isLoading,
    error
  };
};
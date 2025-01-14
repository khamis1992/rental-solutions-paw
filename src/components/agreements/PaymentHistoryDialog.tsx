import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { usePaymentReconciliation } from "./hooks/usePaymentReconciliation";
import { PaymentTrackingTabs } from "./payments/PaymentTrackingTabs";
import { PaymentHistoryView } from "@/types/database/payment.types";

interface PaymentHistoryDialogProps {
  agreementId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PaymentHistoryDialog({
  agreementId,
  open,
  onOpenChange,
}: PaymentHistoryDialogProps) {
  const queryClient = useQueryClient();
  const { isReconciling, reconcilePayments } = usePaymentReconciliation();

  const { data: payments, isLoading, error } = useQuery({
    queryKey: ["payment-history", agreementId],
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
    enabled: open && !!agreementId,
    retry: 2,
  });

  useEffect(() => {
    if (!agreementId || !open) return;

    const channel = supabase
      .channel('payment-history-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'unified_payments',
          filter: `lease_id=eq.${agreementId}`
        },
        async (payload) => {
          console.log('Real-time update received for payment:', payload);
          
          await queryClient.invalidateQueries({ 
            queryKey: ['payment-history', agreementId] 
          });
          
          const eventMessages = {
            INSERT: 'New payment recorded',
            UPDATE: 'Payment updated',
            DELETE: 'Payment removed'
          };
          
          toast.info(
            eventMessages[payload.eventType as keyof typeof eventMessages] || 'Payment record changed',
            {
              description: 'The payment history has been updated.'
            }
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [agreementId, open, queryClient]);

  const handleReconcileAll = async () => {
    try {
      await reconcilePayments(agreementId);
      toast.success("All payments have been reconciled");
    } catch (error) {
      console.error("Error reconciling payments:", error);
      toast.error("Failed to reconcile payments");
    }
  };

  if (error) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="flex flex-col items-center justify-center p-4 text-red-500">
            <p>Error loading payment history</p>
            <p className="text-sm">{error.message}</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Payment History</DialogTitle>
          <DialogDescription>
            View and manage payment history
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <PaymentTrackingTabs
            agreementId={agreementId}
            payments={payments || []}
            paymentHistory={payments || []}
            isLoading={isLoading}
            onReconcileAll={handleReconcileAll}
            isReconciling={isReconciling}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
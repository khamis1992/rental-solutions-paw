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
import { PaymentHistoryContent } from "./payments/PaymentHistoryContent";
import { PaymentAnalysis } from "../payments/PaymentAnalysis";

interface PaymentHistoryDialogProps {
  agreementId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PaymentHistoryDialog({
  agreementId,
  open,
  onOpenChange,
}: PaymentHistoryDialogProps) {
  const queryClient = useQueryClient();

  const { data: paymentHistory, isLoading } = useQuery({
    queryKey: ["payment-history", agreementId],
    queryFn: async () => {
      console.log("Fetching payments for agreement:", agreementId || "all agreements");
      
      const query = supabase
        .from("payments")
        .select(`
          *,
          security_deposits (
            amount,
            status
          ),
          leases (
            agreement_number,
            customer_id,
            profiles:customer_id (
              full_name
            )
          )
        `)
        .order("created_at", { ascending: false });

      if (agreementId) {
        query.eq("lease_id", agreementId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching payments:", error);
        throw error;
      }

      console.log("Fetched payments:", data);
      return data;
    },
    enabled: open,
  });

  // Set up real-time subscription
  useEffect(() => {
    if (!open) return;

    const channel = supabase
      .channel('payment-history-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments',
          ...(agreementId ? { filter: `lease_id=eq.${agreementId}` } : {})
        },
        async (payload) => {
          console.log('Real-time update received for payment history:', payload);
          
          // Invalidate and refetch the payment history query
          await queryClient.invalidateQueries({ queryKey: ['payment-history', agreementId] });
          
          // Show a toast notification
          const eventType = payload.eventType;
          toast.info(
            eventType === 'INSERT'
              ? 'New payment recorded'
              : eventType === 'UPDATE'
              ? 'Payment status updated'
              : 'Payment record changed',
            {
              description: 'The payment history has been updated.'
            }
          );
        }
      )
      .subscribe();

    // Cleanup subscription on unmount or when dialog closes
    return () => {
      supabase.removeChannel(channel);
    };
  }, [agreementId, open, queryClient]);

  const totalPaid = paymentHistory?.reduce((sum, payment) => {
    if (payment.status === "completed") {
      return sum + payment.amount;
    }
    return sum;
  }, 0) || 0;

  const totalRefunded = paymentHistory?.reduce((sum, payment) => {
    if (payment.status === "refunded") {
      return sum + payment.amount;
    }
    return sum;
  }, 0) || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] w-[1200px] h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Payment History</DialogTitle>
          <DialogDescription>
            View all payments and transactions
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="col-span-2">
            <PaymentHistoryContent
              agreementId={agreementId}
              paymentHistory={paymentHistory || []}
              isLoading={isLoading}
              totalPaid={totalPaid}
              totalRefunded={totalRefunded}
            />
          </div>
          <div>
            {paymentHistory?.[0]?.id && (
              <PaymentAnalysis paymentId={paymentHistory[0].id} />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
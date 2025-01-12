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
import { Loader2 } from "lucide-react";

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

  const { data: paymentHistory, isLoading, error } = useQuery({
    queryKey: ["payment-history", agreementId],
    queryFn: async () => {
      console.log("Fetching payments for agreement:", agreementId || "all agreements");
      
      try {
        const query = supabase
          .from("unified_payments")
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
                id,
                full_name,
                phone_number
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

        const transformedData = data.map(payment => ({
          ...payment,
          customer: payment.leases?.profiles || null,
          agreement_number: payment.leases?.agreement_number || null
        }));

        console.log("Transformed payment data:", transformedData);
        return transformedData;
      } catch (err) {
        console.error("Error in payment history query:", err);
        throw err;
      }
    },
    enabled: open,
    retry: 2,
    staleTime: 30000,
  });

  useEffect(() => {
    if (!open) return;

    const channel = supabase
      .channel('payment-history-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'unified_payments',
          ...(agreementId ? { filter: `lease_id=eq.${agreementId}` } : {})
        },
        async (payload) => {
          console.log('Real-time update received for payment history:', payload);
          
          await queryClient.invalidateQueries({ 
            queryKey: ['payment-history', agreementId] 
          });
          
          const eventMessages = {
            INSERT: 'New payment recorded',
            UPDATE: 'Payment status updated',
            DELETE: 'Payment record removed'
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

  const totalPaid = paymentHistory?.reduce((sum, payment) => {
    if (payment.status === "completed") {
      return sum + (payment.amount_paid || 0);
    }
    return sum;
  }, 0) || 0;

  const totalRefunded = paymentHistory?.reduce((sum, payment) => {
    if (payment.status === "refunded") {
      return sum + (payment.amount || 0);
    }
    return sum;
  }, 0) || 0;

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
      <DialogContent className="max-w-[90vw] w-[1200px] h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>Payment History</DialogTitle>
          <DialogDescription>
            View all payments and transactions
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center flex-1">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4 mb-4 overflow-auto">
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
        )}
      </DialogContent>
    </Dialog>
  );
}
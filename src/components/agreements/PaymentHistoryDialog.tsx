import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PaymentImport } from "./PaymentImport";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PaymentHistoryTable } from "./payments/PaymentHistoryTable";
import { PaymentSummary } from "./payments/PaymentSummary";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { format } from "date-fns";

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
      const query = supabase
        .from("payments")
        .select(`
          *,
          security_deposits (
            amount,
            status
          )
        `)
        .order("created_at", { ascending: false });

      if (agreementId) {
        query.eq("lease_id", agreementId);
      }

      const { data, error } = await query;

      if (error) throw error;
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

  const exportToCSV = () => {
    if (!paymentHistory?.length) {
      toast.error("No payment data to export");
      return;
    }

    const headers = [
      "Date",
      "Amount",
      "Status",
      "Payment Method",
      "Transaction ID"
    ];

    const csvData = paymentHistory.map(payment => [
      format(new Date(payment.created_at), "PP"),
      payment.amount.toString(),
      payment.status,
      payment.payment_method || "N/A",
      payment.transaction_id || "N/A"
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("hidden", "");
    a.setAttribute("href", url);
    a.setAttribute("download", `payment_history_${format(new Date(), "yyyy-MM-dd")}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success("Payment history exported successfully");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-[80vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle>Payment History</DialogTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={exportToCSV}
              disabled={!paymentHistory?.length}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
          <DialogDescription>
            View all payments and transactions
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full w-full">
            <div className="space-y-6 px-6">
              <PaymentImport />
              <PaymentSummary totalPaid={totalPaid} totalRefunded={totalRefunded} />
              <PaymentHistoryTable paymentHistory={paymentHistory || []} isLoading={isLoading} />
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
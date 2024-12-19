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
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PaymentHistoryTable } from "./payments/PaymentHistoryTable";
import { PaymentSummary } from "./payments/PaymentSummary";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDeleteAllPayments = async () => {
    setIsDeleting(true);
    try {
      let query = supabase.from("payments").delete();
      
      if (agreementId) {
        query = query.eq("lease_id", agreementId);
      }

      const { error } = await query;

      if (error) throw error;

      toast.success("All payments have been deleted successfully");
      await queryClient.invalidateQueries({ queryKey: ["payment-history", agreementId] });
    } catch (error) {
      console.error("Error deleting payments:", error);
      toast.error("Failed to delete payments");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[90vw] w-[1200px] h-[90vh] flex flex-col overflow-hidden">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Payment History</DialogTitle>
            <DialogDescription>
              View all payments and transactions
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full w-full">
              <div className="space-y-6 px-6">
                <div className="flex justify-between items-center">
                  <PaymentImport />
                  <Button 
                    variant="destructive" 
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={isDeleting || !paymentHistory?.length}
                  >
                    Delete All Payments
                  </Button>
                </div>
                <PaymentSummary totalPaid={totalPaid} totalRefunded={totalRefunded} />
                <PaymentHistoryTable paymentHistory={paymentHistory || []} isLoading={isLoading} />
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete {agreementId ? "all payments for this agreement" : "all payments in the system"}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAllPayments}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete All"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
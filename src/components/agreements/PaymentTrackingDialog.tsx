import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, RefreshCw } from "lucide-react";
import { usePaymentReconciliation } from "./hooks/usePaymentReconciliation";
import { PaymentForm } from "./details/PaymentForm";

interface PaymentTrackingDialogProps {
  agreementId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PaymentTrackingDialog({
  agreementId,
  open,
  onOpenChange,
}: PaymentTrackingDialogProps) {
  const queryClient = useQueryClient();
  const { isReconciling, reconcilePayments } = usePaymentReconciliation();

  const { data: payments, isLoading, error } = useQuery({
    queryKey: ["payment-schedules", agreementId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("payment_schedules")
          .select("*")
          .eq("lease_id", agreementId)
          .order("due_date");

        if (error) throw error;
        return data;
      } catch (err) {
        console.error("Error fetching payment schedules:", err);
        throw err;
      }
    },
    enabled: open && !!agreementId,
    retry: 2,
  });

  const { data: paymentHistory } = useQuery({
    queryKey: ["payment-history", agreementId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payment_history")
        .select("*")
        .eq("lease_id", agreementId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: open && !!agreementId,
  });

  useEffect(() => {
    if (!agreementId || !open) return;

    const channel = supabase
      .channel('payment-schedules-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payment_schedules',
          filter: `lease_id=eq.${agreementId}`
        },
        async (payload) => {
          console.log('Real-time update received for payment schedule:', payload);
          
          await queryClient.invalidateQueries({ 
            queryKey: ['payment-schedules', agreementId] 
          });
          
          const eventMessages = {
            INSERT: 'New payment schedule added',
            UPDATE: 'Payment schedule updated',
            DELETE: 'Payment schedule removed'
          };
          
          toast.info(
            eventMessages[payload.eventType as keyof typeof eventMessages] || 'Payment schedule changed',
            {
              description: 'The payment schedule has been updated.'
            }
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [agreementId, open, queryClient]);

  const getStatusColor = (status: string, dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    
    if (status === "completed") {
      return "bg-green-500/10 text-green-500";
    }
    
    return now > due
      ? "bg-red-500/10 text-red-500"
      : "bg-yellow-500/10 text-yellow-500";
  };

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
            <p>Error loading payment schedules</p>
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
          <DialogTitle>Payment Management</DialogTitle>
          <DialogDescription>
            Track and manage payment schedules, history, and reconciliation
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="schedules" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="schedules">Payment Schedules</TabsTrigger>
            <TabsTrigger value="history">Payment History</TabsTrigger>
            <TabsTrigger value="new">New Payment</TabsTrigger>
          </TabsList>

          <TabsContent value="schedules">
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={handleReconcileAll}
                  disabled={isReconciling || !payments?.length}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isReconciling ? 'animate-spin' : ''}`} />
                  Reconcile All
                </Button>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Reminders Sent</TableHead>
                      <TableHead>Last Reminder</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments?.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          {new Date(payment.due_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{formatCurrency(payment.amount)}</TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={getStatusColor(payment.status, payment.due_date)}
                          >
                            {payment.status.charAt(0).toUpperCase() +
                              payment.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>{payment.reminder_count || 0}</TableCell>
                        <TableCell>
                          {payment.last_reminder_sent
                            ? new Date(payment.last_reminder_sent).toLocaleDateString()
                            : "No reminders sent"}
                        </TableCell>
                      </TableRow>
                    ))}
                    {!payments?.length && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                          No payment schedules found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </div>
          </TabsContent>

          <TabsContent value="history">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Late Fee</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentHistory?.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      {new Date(payment.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{formatCurrency(payment.amount_paid || 0)}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          payment.status === "completed"
                            ? "bg-green-500/10 text-green-500"
                            : "bg-yellow-500/10 text-yellow-500"
                        }
                      >
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {payment.late_fee_applied
                        ? formatCurrency(payment.late_fee_applied)
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))}
                {!paymentHistory?.length && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-4 text-muted-foreground"
                    >
                      No payment history found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="new">
            <PaymentForm agreementId={agreementId} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { formatCurrency } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

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

  const { data: payments, isLoading } = useQuery({
    queryKey: ["payment-schedules", agreementId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payment_schedules")
        .select("*")
        .eq("lease_id", agreementId)
        .order("due_date");

      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  // Set up real-time subscription
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
          
          // Invalidate and refetch the payment schedules query
          await queryClient.invalidateQueries({ queryKey: ['payment-schedules', agreementId] });
          
          // Show a toast notification
          const eventType = payload.eventType;
          toast.info(
            eventType === 'INSERT'
              ? 'New payment schedule added'
              : eventType === 'UPDATE'
              ? 'Payment schedule updated'
              : 'Payment schedule changed',
            {
              description: 'The payment schedule has been updated.'
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Payment Schedule</DialogTitle>
          <DialogDescription>
            Track payment status and reminder history
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div>Loading payment schedule...</div>
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
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  );
}
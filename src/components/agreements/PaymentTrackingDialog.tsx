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
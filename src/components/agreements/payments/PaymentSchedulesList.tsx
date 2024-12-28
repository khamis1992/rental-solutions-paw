import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface PaymentSchedulesListProps {
  payments: any[];
  isLoading: boolean;
  onReconcileAll: () => void;
  isReconciling: boolean;
}

export function PaymentSchedulesList({
  payments,
  isLoading,
  onReconcileAll,
  isReconciling,
}: PaymentSchedulesListProps) {
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
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={onReconcileAll}
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
  );
}
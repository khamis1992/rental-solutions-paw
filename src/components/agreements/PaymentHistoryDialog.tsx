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
import { format } from "date-fns";

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
  const { data: paymentHistory, isLoading } = useQuery({
    queryKey: ["payment-history", agreementId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select(`
          *,
          security_deposits (
            amount,
            status
          )
        `)
        .eq("lease_id", agreementId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/10 text-green-500";
      case "pending":
        return "bg-yellow-500/10 text-yellow-500";
      case "failed":
        return "bg-red-500/10 text-red-500";
      case "refunded":
        return "bg-blue-500/10 text-blue-500";
      default:
        return "bg-gray-500/10 text-gray-500";
    }
  };

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
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Payment History</DialogTitle>
          <DialogDescription>
            View all payments and transactions for this agreement
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-lg border bg-card">
            <div className="text-sm text-muted-foreground">Total Paid</div>
            <div className="text-2xl font-semibold">{formatCurrency(totalPaid)}</div>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <div className="text-sm text-muted-foreground">Total Refunded</div>
            <div className="text-2xl font-semibold">{formatCurrency(totalRefunded)}</div>
          </div>
        </div>

        {isLoading ? (
          <div>Loading payment history...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Transaction ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentHistory?.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    {format(new Date(payment.created_at), "PP")}
                  </TableCell>
                  <TableCell>
                    {payment.security_deposits ? "Security Deposit" : "Payment"}
                  </TableCell>
                  <TableCell>{formatCurrency(payment.amount)}</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={getStatusColor(payment.status)}
                    >
                      {payment.status.charAt(0).toUpperCase() +
                        payment.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {payment.payment_method
                      ? payment.payment_method
                          .split("_")
                          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                          .join(" ")
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    {payment.transaction_id || "N/A"}
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
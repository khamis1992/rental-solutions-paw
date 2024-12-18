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
import { PaymentImport } from "./PaymentImport";
import { ArrowUpCircle, ArrowDownCircle } from "lucide-react";

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

  const getAmountDisplay = (amount: number) => {
    const isNegative = amount < 0;
    const displayAmount = formatCurrency(Math.abs(amount));
    const textColorClass = isNegative ? "text-[#ea384c]" : "text-green-600";
    const Icon = isNegative ? ArrowDownCircle : ArrowUpCircle;
    
    return (
      <div className={`flex items-center gap-2 ${textColorClass}`}>
        <Icon className="h-4 w-4" />
        <span>{isNegative ? `-${displayAmount}` : displayAmount}</span>
      </div>
    );
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
            View all payments and transactions
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <PaymentImport />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <TableCell>
                      {getAmountDisplay(payment.amount)}
                    </TableCell>
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
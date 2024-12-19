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
import { format, parseISO } from "date-fns";
import { ArrowUpCircle, ArrowDownCircle, RefreshCw } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { usePaymentReconciliation } from "../hooks/usePaymentReconciliation";

interface PaymentHistoryTableProps {
  paymentHistory: any[];
  isLoading: boolean;
}

export function PaymentHistoryTable({ paymentHistory, isLoading }: PaymentHistoryTableProps) {
  const { isReconciling, reconcilePayments } = usePaymentReconciliation();

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

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "dd/MM/yyyy");
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  };

  const handleReconcile = async (paymentId: string) => {
    try {
      await reconcilePayments(paymentId);
    } catch (error) {
      console.error("Failed to reconcile payment:", error);
    }
  };

  if (isLoading) {
    return <div>Loading payment history...</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Payment Method</TableHead>
          <TableHead>Transaction ID</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {paymentHistory?.map((payment) => (
          <TableRow key={payment.id}>
            <TableCell>
              {formatDate(payment.created_at)}
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
                    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")
                : "N/A"}
            </TableCell>
            <TableCell>
              {payment.transaction_id || "N/A"}
            </TableCell>
            <TableCell>
              {payment.description || "No description provided"}
            </TableCell>
            <TableCell>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleReconcile(payment.id)}
                disabled={isReconciling || payment.status === 'completed'}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${isReconciling ? 'animate-spin' : ''}`} />
                Reconcile
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
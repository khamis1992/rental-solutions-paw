import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface PaymentHistoryTableProps {
  paymentHistory: any[];
  isLoading: boolean;
}

export function PaymentHistoryTable({ paymentHistory, isLoading }: PaymentHistoryTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Agreement #</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Method</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {paymentHistory.map((payment) => (
          <TableRow key={payment.id}>
            <TableCell>
              {payment.payment_date
                ? format(new Date(payment.payment_date), "MMM d, yyyy")
                : format(new Date(payment.created_at), "MMM d, yyyy")}
            </TableCell>
            <TableCell>{payment.agreement_number || "N/A"}</TableCell>
            <TableCell>{payment.customer?.full_name || "Unknown"}</TableCell>
            <TableCell>{payment.customer?.phone_number || "N/A"}</TableCell>
            <TableCell>${payment.amount.toFixed(2)}</TableCell>
            <TableCell>
              <Badge variant="outline">
                {payment.payment_method || "Not specified"}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge
                variant={
                  payment.status === "completed"
                    ? "success"
                    : payment.status === "failed"
                    ? "destructive"
                    : "secondary"
                }
              >
                {payment.status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
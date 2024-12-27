import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

interface PaymentHistoryListProps {
  paymentHistory: any[];
}

export function PaymentHistoryList({ paymentHistory }: PaymentHistoryListProps) {
  return (
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
  );
}
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import { Payment } from "@/types/database/payment.types";

interface PaymentHistoryProps {
  payments: Payment[];
}

export const PaymentHistory = ({ payments }: PaymentHistoryProps) => {
  // Calculate total balance
  const totalBalance = payments.reduce((sum, payment) => sum + payment.balance, 0);

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Payment Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Amount Paid</TableHead>
            <TableHead>Balance</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Payment Method</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments?.length ? (
            <>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    {payment.payment_date 
                      ? format(new Date(payment.payment_date), 'dd/MM/yyyy')
                      : format(new Date(payment.created_at), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell>{formatCurrency(payment.amount)}</TableCell>
                  <TableCell>{formatCurrency(payment.amount_paid)}</TableCell>
                  <TableCell>{formatCurrency(payment.balance)}</TableCell>
                  <TableCell>{payment.description || '-'}</TableCell>
                  <TableCell className="capitalize">
                    {payment.payment_method?.toLowerCase().replace('_', ' ') || '-'}
                  </TableCell>
                </TableRow>
              ))}
              {/* Summary row for total balance */}
              <TableRow className="font-medium bg-muted/50">
                <TableCell colSpan={3} className="text-right">Total Overdue Payments:</TableCell>
                <TableCell>{formatCurrency(totalBalance)}</TableCell>
                <TableCell colSpan={2}></TableCell>
              </TableRow>
            </>
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                No payment history found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
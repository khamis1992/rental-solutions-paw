import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { formatDateToDisplay } from "@/lib/dateUtils";
import { PaymentHistoryView } from "@/types/database/payment.types";

export interface PaymentHistoryTableProps {
  payments: PaymentHistoryView[];
  isLoading: boolean;
}

export const PaymentHistoryTable = ({ payments, isLoading }: PaymentHistoryTableProps) => {
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Agreement #</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Method</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.map((payment) => (
          <TableRow key={payment.id}>
            <TableCell>
              {payment.payment_date ? formatDateToDisplay(new Date(payment.payment_date)) : 'N/A'}
            </TableCell>
            <TableCell>{payment.agreement_number || 'N/A'}</TableCell>
            <TableCell>{payment.customer_name || 'Unknown'}</TableCell>
            <TableCell>{formatCurrency(payment.amount)}</TableCell>
            <TableCell>{payment.payment_method || 'N/A'}</TableCell>
            <TableCell>{payment.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { AccountingTransaction } from "../types/transaction.types";

interface ImportedTransactionsTableProps {
  transactions: AccountingTransaction[];
}

export const ImportedTransactionsTable = ({ transactions }: ImportedTransactionsTableProps) => {
  return (
    <div className="rounded-md border mt-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Transaction ID</TableHead>
            <TableHead>Agreement Number</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Payment Method</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Amount (QAR)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell>
                {transaction.transaction_date ? new Date(transaction.transaction_date).toLocaleDateString() : 'N/A'}
              </TableCell>
              <TableCell>{transaction.transaction_id || 'N/A'}</TableCell>
              <TableCell>{transaction.agreement_number || 'N/A'}</TableCell>
              <TableCell>{transaction.customer_name || 'N/A'}</TableCell>
              <TableCell>{transaction.description || 'N/A'}</TableCell>
              <TableCell>{transaction.payment_method || 'N/A'}</TableCell>
              <TableCell>{transaction.status || 'N/A'}</TableCell>
              <TableCell className="text-right">
                {transaction.amount ? formatCurrency(parseFloat(transaction.amount)) : 'N/A'}
              </TableCell>
            </TableRow>
          ))}
          {!transactions.length && (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground">
                No transactions found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
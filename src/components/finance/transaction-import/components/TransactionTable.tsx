import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ImportedTransaction } from "../types/transaction.types";
import { formatDate } from "@/lib/dateUtils";

interface TransactionTableProps {
  transactions: ImportedTransaction[];
}

export const TransactionTable = ({ transactions }: TransactionTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((transaction, index) => (
          <TableRow key={index}>
            <TableCell>
              {formatDate(transaction.transaction_date) || 'N/A'}
            </TableCell>
            <TableCell>{transaction.description || 'N/A'}</TableCell>
            <TableCell>{transaction.category || 'N/A'}</TableCell>
            <TableCell>{typeof transaction.amount === 'number' ? transaction.amount.toFixed(2) : transaction.amount || 'N/A'}</TableCell>
            <TableCell>{transaction.status || 'N/A'}</TableCell>
          </TableRow>
        ))}
        {transactions.length === 0 && (
          <TableRow>
            <TableCell colSpan={5} className="text-center py-4">
              No transactions to display
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};
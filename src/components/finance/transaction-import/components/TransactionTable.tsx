import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ImportedTransaction } from "../types/transaction.types";
import { format, isValid, parseISO } from "date-fns";

interface TransactionTableProps {
  transactions: ImportedTransaction[];
}

export const TransactionTable = ({ transactions }: TransactionTableProps) => {
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    
    try {
      // Try different date formats
      let date: Date | null = null;
      
      // Try parsing as ISO string
      date = parseISO(dateString);
      if (isValid(date)) {
        return format(date, 'dd/MM/yyyy');
      }
      
      // Try parsing as regular date string
      date = new Date(dateString);
      if (isValid(date)) {
        return format(date, 'dd/MM/yyyy');
      }
      
      // Try DD-MM-YYYY format
      const parts = dateString.split(/[-/]/);
      if (parts.length === 3) {
        date = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
        if (isValid(date)) {
          return format(date, 'dd/MM/yyyy');
        }
      }
      
      return 'N/A';
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'N/A';
    }
  };

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
              {formatDate(transaction.transaction_date)}
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
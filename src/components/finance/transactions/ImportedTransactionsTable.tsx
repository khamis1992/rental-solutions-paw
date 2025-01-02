import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  transaction_date: string;
  cost_type?: string;
  is_recurring?: boolean;
}

interface ImportedTransactionsTableProps {
  transactions: Transaction[];
}

export const ImportedTransactionsTable = ({ transactions }: ImportedTransactionsTableProps) => {
  return (
    <div className="rounded-md border mt-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Cost Type</TableHead>
            <TableHead className="text-right">Amount (QAR)</TableHead>
            <TableHead>Recurring</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell>
                {new Date(transaction.transaction_date).toLocaleDateString()}
              </TableCell>
              <TableCell>{transaction.type}</TableCell>
              <TableCell>{transaction.description}</TableCell>
              <TableCell>{transaction.cost_type || 'N/A'}</TableCell>
              <TableCell className="text-right">
                {formatCurrency(transaction.amount)}
              </TableCell>
              <TableCell>
                {transaction.is_recurring ? 'Yes' : 'No'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
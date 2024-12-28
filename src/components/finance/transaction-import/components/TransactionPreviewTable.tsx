import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

interface TransactionPreviewTableProps {
  data: any[];
  onDataChange?: (data: any[]) => void;
}

export const TransactionPreviewTable = ({ data }: TransactionPreviewTableProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Agreement Number</TableHead>
            <TableHead>Customer Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data && data.length > 0 ? (
            data.map((row, index) => (
              <TableRow key={index}>
                <TableCell>
                  {row.payment_date ? new Date(row.payment_date).toLocaleDateString() : 'N/A'}
                </TableCell>
                <TableCell>{formatCurrency(row.amount)}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="bg-green-500/10 text-green-500">
                    Income
                  </Badge>
                </TableCell>
                <TableCell>{row.agreement_number}</TableCell>
                <TableCell>{row.customer_name || 'N/A'}</TableCell>
                <TableCell>{row.description}</TableCell>
                <TableCell>
                  <Badge variant="outline">Pending Import</Badge>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                No transactions to display
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
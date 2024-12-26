import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, isValid, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface TransactionPreviewTableProps {
  data: any[];
  onDataChange: (data: any[]) => void;
}

export const TransactionPreviewTable = ({ data, onDataChange }: TransactionPreviewTableProps) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    
    try {
      // First try parsing as ISO string
      const date = parseISO(dateString);
      if (isValid(date)) {
        return format(date, 'dd/MM/yyyy');
      }
      
      // If not valid ISO, try creating a new Date
      const fallbackDate = new Date(dateString);
      if (isValid(fallbackDate)) {
        return format(fallbackDate, 'dd/MM/yyyy');
      }
      
      // If still not valid, return N/A
      return 'N/A';
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'N/A';
    }
  };

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Transaction Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => (
            <TableRow key={index}>
              <TableCell>{formatDate(row.transaction_date)}</TableCell>
              <TableCell>{typeof row.amount === 'number' ? row.amount.toFixed(2) : row.amount}</TableCell>
              <TableCell>{row.description}</TableCell>
              <TableCell>
                <Badge variant="outline">
                  {row.status || 'pending'}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
          {data.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                No data to preview
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, isValid, parseISO } from "date-fns";
import { ImportedTransaction } from "./types/transaction.types";

interface TransactionPreviewTableProps {
  data: ImportedTransaction[];
  onDataChange: (data: ImportedTransaction[]) => void;
}

export const TransactionPreviewTable = ({ data, onDataChange }: TransactionPreviewTableProps) => {
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
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Agreement Number</TableHead>
            <TableHead>Customer Name</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>License Plate</TableHead>
            <TableHead>Vehicle</TableHead>
            <TableHead>Payment Date</TableHead>
            <TableHead>Payment Method</TableHead>
            <TableHead>Payment Number</TableHead>
            <TableHead>Payment Description</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => (
            <TableRow key={index}>
              <TableCell>{row.agreement_number || 'N/A'}</TableCell>
              <TableCell>{row.customer_name || 'N/A'}</TableCell>
              <TableCell>{typeof row.amount === 'number' ? row.amount.toFixed(2) : row.amount || 'N/A'}</TableCell>
              <TableCell>{row.license_plate || 'N/A'}</TableCell>
              <TableCell>{row.vehicle || 'N/A'}</TableCell>
              <TableCell>{formatDate(row.payment_date)}</TableCell>
              <TableCell>{row.payment_method || 'N/A'}</TableCell>
              <TableCell>{row.payment_number || 'N/A'}</TableCell>
              <TableCell>{row.description || 'N/A'}</TableCell>
            </TableRow>
          ))}
          {data.length === 0 && (
            <TableRow>
              <TableCell colSpan={9} className="text-center">
                No data to preview
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
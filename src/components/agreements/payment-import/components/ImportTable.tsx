import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format, parse, isValid } from "date-fns";

interface ImportTableProps {
  headers: string[];
  data: Record<string, unknown>[];
  onRefresh?: () => void;
}

export const ImportTable = ({ headers, data, onRefresh }: ImportTableProps) => {
  if (data.length === 0) return null;

  const formatDateValue = (value: unknown, header: string): string => {
    // Only process Payment_Date field
    if (header !== 'Payment_Date') return String(value);

    try {
      const dateStr = String(value);
      
      // Try parsing with different formats
      const formats = ['yyyy-MM-dd', 'MM/dd/yyyy', 'dd/MM/yyyy'];
      let parsedDate: Date | null = null;
      
      for (const dateFormat of formats) {
        try {
          const attemptedDate = parse(dateStr, dateFormat, new Date());
          if (isValid(attemptedDate)) {
            parsedDate = attemptedDate;
            break;
          }
        } catch (e) {
          continue;
        }
      }

      // If no format worked, try direct Date constructor
      if (!parsedDate) {
        const directDate = new Date(dateStr);
        if (isValid(directDate)) {
          parsedDate = directDate;
        }
      }

      if (!parsedDate) {
        console.error('Invalid date:', dateStr);
        return dateStr;
      }

      // For dates before 2025, swap day and month
      if (parsedDate.getFullYear() < 2025) {
        const day = parsedDate.getDate();
        const month = parsedDate.getMonth();
        const year = parsedDate.getFullYear();
        parsedDate = new Date(year, day - 1, month + 1);
      }

      // Format in DD/MM/YYYY
      return format(parsedDate, 'dd/MM/yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return String(value);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Imported Raw Data</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {headers.map((header) => (
                  <TableHead key={header}>{header}</TableHead>
                ))}
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, index) => (
                <TableRow key={index}>
                  {headers.map((header) => (
                    <TableCell key={`${index}-${header}`}>
                      {formatDateValue(row[header], header)}
                    </TableCell>
                  ))}
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        // Delete functionality will be handled here
                        toast.error('Delete functionality coming soon');
                      }}
                      className="h-8"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
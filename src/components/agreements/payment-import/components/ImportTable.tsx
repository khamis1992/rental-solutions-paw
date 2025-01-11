import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, parse, isValid } from "date-fns";
import { swap_day_month } from "@/lib/dateUtils";

interface ImportTableProps {
  headers: string[];
  data: Record<string, unknown>[];
}

export const ImportTable = ({ headers, data }: ImportTableProps) => {
  if (data.length === 0) return null;

  const formatDateValue = (value: unknown, header: string): string => {
    // Only process date fields
    if (header !== 'Payment_Date') return String(value);

    try {
      const dateStr = String(value);
      
      // Parse the date string
      let parsedDate: Date | null = null;
      
      // Try different date formats
      const formats = ['yyyy-MM-dd', 'MM/dd/yyyy', 'dd/MM/yyyy'];
      
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

      // If no valid date was parsed, try direct Date constructor
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
        const swappedDate = swap_day_month(parsedDate);
        return format(swappedDate, 'dd/MM/yyyy');
      }

      // Format the date in DD/MM/YYYY format
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
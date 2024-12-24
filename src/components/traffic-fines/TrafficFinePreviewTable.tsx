import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";

interface TrafficFinePreviewData {
  serial_number: string;
  violation_number: string;
  violation_date: string;
  license_plate: string;
  fine_location: string;
  violation_charge: string;
  fine_amount: number;
  violation_points: number;
}

interface TrafficFinePreviewTableProps {
  data: TrafficFinePreviewData[];
}

export const TrafficFinePreviewTable = ({ data }: TrafficFinePreviewTableProps) => {
  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">Serial</TableHead>
            <TableHead className="font-semibold">Violation No.</TableHead>
            <TableHead className="font-semibold">Date</TableHead>
            <TableHead className="font-semibold">Plate Number</TableHead>
            <TableHead className="font-semibold">Location</TableHead>
            <TableHead className="font-semibold">Charge</TableHead>
            <TableHead className="font-semibold">Fine</TableHead>
            <TableHead className="font-semibold">Points</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((fine, index) => (
            <TableRow key={index}>
              <TableCell>{fine.serial_number}</TableCell>
              <TableCell>{fine.violation_number}</TableCell>
              <TableCell>{format(new Date(fine.violation_date), "PPP")}</TableCell>
              <TableCell>{fine.license_plate}</TableCell>
              <TableCell>{fine.fine_location}</TableCell>
              <TableCell>{fine.violation_charge}</TableCell>
              <TableCell>{formatCurrency(fine.fine_amount)}</TableCell>
              <TableCell>{fine.violation_points}</TableCell>
            </TableRow>
          ))}
          {!data.length && (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                No data to preview
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
import {
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const TrafficFineTableHeader = () => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Serial</TableHead>
        <TableHead>Violation No.</TableHead>
        <TableHead>Violation Date</TableHead>
        <TableHead>License Plate</TableHead>
        <TableHead>Location</TableHead>
        <TableHead>Charge</TableHead>
        <TableHead>Fine</TableHead>
        <TableHead>Points</TableHead>
        <TableHead>Status</TableHead>
        <TableHead>Customer</TableHead>
        <TableHead>Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};
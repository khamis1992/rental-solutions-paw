import {
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const MaintenanceTableHeader = () => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>License Plate</TableHead>
        <TableHead>Vehicle</TableHead>
        <TableHead>Service Type</TableHead>
        <TableHead>Status</TableHead>
        <TableHead>Scheduled Date</TableHead>
        <TableHead className="text-right">Cost</TableHead>
      </TableRow>
    </TableHeader>
  );
};
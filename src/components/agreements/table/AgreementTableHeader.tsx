import {
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const AgreementTableHeader = () => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Agreement ID</TableHead>
        <TableHead>Customer</TableHead>
        <TableHead>Vehicle</TableHead>
        <TableHead>Start Date</TableHead>
        <TableHead>End Date</TableHead>
        <TableHead>Status</TableHead>
        <TableHead>Amount</TableHead>
        <TableHead className="text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const AgreementTableHeader = () => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Agreement Number</TableHead>
        <TableHead>Car No</TableHead>
        <TableHead>Customer Name</TableHead>
        <TableHead>Start Date</TableHead>
        <TableHead>End Date</TableHead>
        <TableHead>Status</TableHead>
        <TableHead className="text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};
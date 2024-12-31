import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const AgreementTableHeader = () => {
  return (
    <TableHeader className="bg-muted/50">
      <TableRow>
        <TableHead className="w-[150px]">Agreement Number</TableHead>
        <TableHead className="w-[120px]">License Plate</TableHead>
        <TableHead className="w-[200px]">Vehicle</TableHead>
        <TableHead className="w-[200px]">Customer Name</TableHead>
        <TableHead className="w-[120px]">Start Date</TableHead>
        <TableHead className="w-[120px]">End Date</TableHead>
        <TableHead className="w-[120px]">Status</TableHead>
        <TableHead className="w-[120px]">Payment Status</TableHead>
        <TableHead className="w-[120px]">Next Payment</TableHead>
        <TableHead className="text-right w-[150px]">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};
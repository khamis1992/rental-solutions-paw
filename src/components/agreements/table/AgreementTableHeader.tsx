import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const AgreementTableHeader = () => {
  return (
    <TableHeader className="bg-background-alt border-b">
      <TableRow>
        <TableHead className="w-[150px] font-semibold">Agreement Number</TableHead>
        <TableHead className="w-[120px] font-semibold">License Plate</TableHead>
        <TableHead className="w-[200px] font-semibold">Vehicle</TableHead>
        <TableHead className="w-[200px] font-semibold">Customer Name</TableHead>
        <TableHead className="w-[120px] font-semibold">Start Date</TableHead>
        <TableHead className="w-[120px] font-semibold">End Date</TableHead>
        <TableHead className="w-[120px] font-semibold">Status</TableHead>
        <TableHead className="text-right w-[150px] font-semibold">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};
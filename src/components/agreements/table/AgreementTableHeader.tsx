
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

export const AgreementTableHeader = () => {
  return (
    <TableHeader className={cn(
      "bg-background-alt border-b",
      "[&_th]:px-4 [&_th]:py-3"
    )}>
      <TableRow>
        <TableHead className="w-[150px] font-semibold text-primary">Agreement Number</TableHead>
        <TableHead className="w-[120px] font-semibold text-primary">License Plate</TableHead>
        <TableHead className="w-[200px] font-semibold text-primary">Vehicle</TableHead>
        <TableHead className="w-[200px] font-semibold text-primary">Customer Name</TableHead>
        <TableHead className="w-[120px] font-semibold text-primary">Start Date</TableHead>
        <TableHead className="w-[120px] font-semibold text-primary">End Date</TableHead>
        <TableHead className="w-[120px] font-semibold text-primary">Status</TableHead>
        <TableHead className="text-right w-[150px] font-semibold text-primary">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};

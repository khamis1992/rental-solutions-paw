import {
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const CustomerTableHeader = () => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="py-2 text-xs font-medium">Name</TableHead>
        <TableHead className="py-2 text-xs font-medium">Phone</TableHead>
        <TableHead className="py-2 text-xs font-medium">Address</TableHead>
        <TableHead className="py-2 text-xs font-medium">Driver License</TableHead>
        <TableHead className="py-2 text-xs font-medium">Documents</TableHead>
        <TableHead className="py-2 text-xs font-medium">Status</TableHead>
        <TableHead className="py-2 text-xs font-medium text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};
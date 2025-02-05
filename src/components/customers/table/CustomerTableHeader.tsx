import {
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const CustomerTableHeader = () => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Name</TableHead>
        <TableHead>Phone</TableHead>
        <TableHead>Email</TableHead>
        <TableHead>Address</TableHead>
        <TableHead>Driver License</TableHead>
        <TableHead>Documents</TableHead>
        <TableHead>Created</TableHead>
      </TableRow>
    </TableHeader>
  );
};
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";

interface CategoryTableHeaderProps {
  onSelectAll: (checked: boolean) => void;
  allSelected: boolean;
}

export const CategoryTableHeader = ({ onSelectAll, allSelected }: CategoryTableHeaderProps) => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-12">
          <Checkbox
            checked={allSelected}
            onCheckedChange={onSelectAll}
            aria-label="Select all"
          />
        </TableHead>
        <TableHead>Name</TableHead>
        <TableHead>Type</TableHead>
        <TableHead>Description</TableHead>
        <TableHead>Budget</TableHead>
        <TableHead>Status</TableHead>
        <TableHead className="text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};
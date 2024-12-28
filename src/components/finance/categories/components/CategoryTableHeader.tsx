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
        <TableHead className="w-[50px]">
          <Checkbox
            checked={allSelected}
            onCheckedChange={(checked) => onSelectAll(checked === true)}
          />
        </TableHead>
        <TableHead>Name</TableHead>
        <TableHead>Type</TableHead>
        <TableHead>Description</TableHead>
        <TableHead>Budget</TableHead>
        <TableHead className="w-[100px]">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};
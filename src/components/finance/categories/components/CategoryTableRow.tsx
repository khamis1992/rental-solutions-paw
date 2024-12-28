import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Pencil, Trash2 } from "lucide-react";
import { BudgetProgress } from "../budget/BudgetProgress";

interface Category {
  id: string;
  name: string;
  type: string;
  description: string;
  budget_limit: number | null;
  budget_period: string | null;
  current_spending?: number;
}

interface CategoryTableRowProps {
  category: Category;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const CategoryTableRow = ({
  category,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}: CategoryTableRowProps) => {
  return (
    <TableRow>
      <TableCell>
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => onSelect(checked === true)}
        />
      </TableCell>
      <TableCell>{category.name}</TableCell>
      <TableCell>{category.type}</TableCell>
      <TableCell>{category.description}</TableCell>
      <TableCell>
        {category.budget_limit ? (
          <BudgetProgress
            budgetLimit={category.budget_limit}
            currentSpending={category.current_spending || 0}
            period={category.budget_period}
          />
        ) : (
          "-"
        )}
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={onEdit}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onDelete}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};
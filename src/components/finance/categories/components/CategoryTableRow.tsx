import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { BudgetProgress } from "../budget/BudgetProgress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

interface Category {
  id: string;
  name: string;
  type: string;
  description: string | null;
  budget_limit: number | null;
  budget_period: string | null;
  is_active?: boolean;
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
          onCheckedChange={onSelect}
          aria-label={`Select ${category.name}`}
        />
      </TableCell>
      <TableCell>{category.name}</TableCell>
      <TableCell>
        <Badge variant={category.type === 'INCOME' ? 'default' : 'secondary'}>
          {category.type}
        </Badge>
      </TableCell>
      <TableCell>{category.description}</TableCell>
      <TableCell>
        {category.budget_limit ? (
          <BudgetProgress
            budgetLimit={category.budget_limit}
            currentSpending={category.current_spending || 0}
            period={category.budget_period}
          />
        ) : (
          <span className="text-muted-foreground">No budget set</span>
        )}
      </TableCell>
      <TableCell>
        <Switch
          checked={category.is_active ?? true}
          disabled
          aria-label="Category status"
        />
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onEdit}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { BudgetProgress } from "../budget/BudgetProgress";
import { Badge } from "@/components/ui/badge";

interface CategoryTableRowProps {
  category: {
    id: string;
    name: string;
    type: string;
    description: string | null;
    budget_limit: number | null;
    budget_period: string | null;
    is_active: boolean;
    currentSpending: number;
  };
  currentSpending: number;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
}

export const CategoryTableRow = ({
  category,
  onEdit,
  onDelete,
  onToggleActive,
}: CategoryTableRowProps) => {
  return (
    <TableRow>
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
            currentSpending={category.currentSpending}
            period={category.budget_period}
          />
        ) : (
          <span className="text-muted-foreground">No budget set</span>
        )}
      </TableCell>
      <TableCell>
        <Switch
          checked={category.is_active}
          onCheckedChange={(checked) => onToggleActive(category.id, checked)}
        />
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(category.id)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(category.id)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};
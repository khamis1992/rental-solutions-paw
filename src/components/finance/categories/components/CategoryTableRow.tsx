import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";
import { BudgetProgress } from "../BudgetProgress";

interface Category {
  id: string;
  name: string;
  type: string;
  description: string;
  budget_limit: number | null;
  parent_id: string | null;
  budget_period: string | null;
  is_active: boolean;
  current_spending?: number;
}

interface CategoryTableRowProps {
  category: Category;
  selected: boolean;
  onSelect: (id: string, checked: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function CategoryTableRow({
  category,
  selected,
  onSelect,
  onEdit,
  onDelete,
}: CategoryTableRowProps) {
  return (
    <tr className="border-t">
      <td className="p-2">
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => onSelect(category.id, e.target.checked)}
          className="h-4 w-4"
        />
      </td>
      <td className="p-2">{category.name}</td>
      <td className="p-2 capitalize">{category.type}</td>
      <td className="p-2">
        {category.budget_limit ? (
          <BudgetProgress
            current={category.current_spending || 0}
            limit={category.budget_limit}
          />
        ) : (
          "No limit"
        )}
      </td>
      <td className="p-2 capitalize">{category.budget_period || "N/A"}</td>
      <td className="p-2">
        <span
          className={`inline-block px-2 py-1 rounded-full text-xs ${
            category.is_active
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {category.is_active ? "Active" : "Inactive"}
        </span>
      </td>
      <td className="p-2 text-right">
        <Button
          variant="ghost"
          size="icon"
          onClick={onEdit}
          className="h-8 w-8 mr-1"
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          className="h-8 w-8 text-destructive"
        >
          <Trash className="h-4 w-4" />
        </Button>
      </td>
    </tr>
  );
}
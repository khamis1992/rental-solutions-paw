import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, FolderPlus, Pencil, Trash2, CalendarRange } from "lucide-react";
import { CategoryDialog } from "./CategoryDialog";
import { BudgetProgress } from "./budget/BudgetProgress";
import { toast } from "sonner";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { addMonths, startOfMonth, endOfMonth } from "date-fns";

interface Category {
  id: string;
  name: string;
  type: string;
  description: string;
  budget_limit: number | null;
  parent_id: string | null;
  budget_period: string | null;
  is_active?: boolean;
  current_spending?: number;
}

export const CategoryList = () => {
  const [showDialog, setShowDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState({
    from: startOfMonth(addMonths(new Date(), -1)),
    to: endOfMonth(new Date())
  });

  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories", dateRange],
    queryFn: async () => {
      // First get categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("accounting_categories")
        .select("*")
        .order("name");

      if (categoriesError) throw categoriesError;

      // Then get transactions for spending calculation within date range
      const { data: transactions, error: transactionsError } = await supabase
        .from("accounting_transactions")
        .select("amount, category_id, transaction_date")
        .gte("transaction_date", dateRange.from.toISOString())
        .lte("transaction_date", dateRange.to.toISOString());

      if (transactionsError) throw transactionsError;

      // Calculate current spending for each category
      const categoriesWithSpending = categoriesData.map((category: Category) => {
        const categoryTransactions = transactions.filter(
          (t) => t.category_id === category.id
        );
        
        const currentSpending = categoryTransactions.reduce(
          (sum, t) => sum + (t.amount || 0),
          0
        );

        return {
          ...category,
          current_spending: currentSpending,
        };
      });

      return categoriesWithSpending as Category[];
    },
  });

  const handleDelete = async (categoryId: string) => {
    try {
      const { error } = await supabase
        .from("accounting_categories")
        .delete()
        .eq("id", categoryId);

      if (error) throw error;

      toast.success("Category deleted successfully");
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category");
    }
  };

  const filteredCategories = categories?.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Categories</h2>
        <Button onClick={() => setShowDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Input
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <DateRangePicker
          value={dateRange}
          onChange={setDateRange}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories?.map((category) => (
                <TableRow key={category.id}>
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
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingCategory(category);
                          setShowDialog(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(category.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!filteredCategories?.length && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    No categories found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <CategoryDialog
        open={showDialog}
        onOpenChange={(open) => {
          setShowDialog(open);
          if (!open) setEditingCategory(null);
        }}
        category={editingCategory}
      />
    </div>
  );
};
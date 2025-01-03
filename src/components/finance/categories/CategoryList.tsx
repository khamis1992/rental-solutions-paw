import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus } from "lucide-react";
import { CategoryDialog } from "./CategoryDialog";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { addMonths, startOfMonth, endOfMonth } from "date-fns";
import { ImportExportCategories } from "./ImportExportCategories";
import type { DateRange } from "react-day-picker";
import { toast } from "sonner";
import { CategoryTableHeader } from "./components/CategoryTableHeader";
import { CategoryTableRow } from "./components/CategoryTableRow";

interface Category {
  id: string;
  name: string;
  type: string;
  description: string;
  budget_limit: number | null;
  parent_id: string | null;
  budget_period: string | null;
  is_active: boolean;
}

export const CategoryList = () => {
  const [showDialog, setShowDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfMonth(addMonths(new Date(), -1)),
    to: endOfMonth(new Date())
  });

  const { data: categoriesWithSpending, isLoading } = useQuery({
    queryKey: ["categories", dateRange],
    queryFn: async () => {
      // Fetch categories
      const { data: categories, error: categoriesError } = await supabase
        .from("accounting_categories")
        .select("*")
        .order("name");

      if (categoriesError) throw categoriesError;

      // Fetch transactions for the date range
      const { data: transactions, error: transactionsError } = await supabase
        .from("accounting_transactions")
        .select("amount, category_id, transaction_date")
        .gte("transaction_date", dateRange.from?.toISOString())
        .lte("transaction_date", dateRange.to?.toISOString());

      if (transactionsError) throw transactionsError;

      // Calculate spending for each category
      const categoriesWithSpending = categories.map((category: Category) => {
        const categoryTransactions = transactions.filter(
          (t) => t.category_id === category.id
        );
        
        const currentSpending = categoryTransactions.reduce(
          (sum, t) => sum + (t.amount || 0),
          0
        );

        return {
          ...category,
          currentSpending
        };
      });

      return categoriesWithSpending;
    },
  });

  const filteredCategories = categoriesWithSpending?.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("accounting_categories")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Category deleted successfully");
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category");
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("accounting_categories")
        .update({ is_active: isActive })
        .eq("id", id);

      if (error) throw error;
      toast.success(`Category ${isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error("Error updating category status:", error);
      toast.error("Failed to update category status");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Categories</h2>
        <div className="flex gap-2">
          <ImportExportCategories />
          <Button onClick={() => setShowDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>
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
          onChange={(value) => setDateRange(value || { 
            from: startOfMonth(addMonths(new Date(), -1)),
            to: endOfMonth(new Date())
          })}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <CategoryTableHeader />
            <TableBody>
              {filteredCategories?.map((category) => (
                <CategoryTableRow
                  key={category.id}
                  category={category}
                  currentSpending={category.currentSpending}
                  onEdit={() => {
                    setEditingCategory(category);
                    setShowDialog(true);
                  }}
                  onDelete={handleDelete}
                  onToggleActive={handleToggleActive}
                />
              ))}
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
        editCategory={editingCategory}
      />
    </div>
  );
};

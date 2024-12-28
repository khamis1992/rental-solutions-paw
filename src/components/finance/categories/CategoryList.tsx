import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Trash2 } from "lucide-react";
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
  is_active?: boolean;
  current_spending?: number;
}

export const CategoryList = () => {
  const [showDialog, setShowDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfMonth(addMonths(new Date(), -1)),
    to: endOfMonth(new Date())
  });

  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories", dateRange],
    queryFn: async () => {
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("accounting_categories")
        .select("*")
        .order("name");

      if (categoriesError) throw categoriesError;

      const { data: transactions, error: transactionsError } = await supabase
        .from("accounting_transactions")
        .select("amount, category_id, transaction_date")
        .gte("transaction_date", dateRange.from.toISOString())
        .lte("transaction_date", dateRange.to.toISOString());

      if (transactionsError) throw transactionsError;

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

      return categoriesWithSpending;
    },
  });

  const filteredCategories = categories?.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked && filteredCategories) {
      setSelectedCategories(filteredCategories.map(cat => cat.id));
    } else {
      setSelectedCategories([]);
    }
  };

  const handleSelectCategory = (categoryId: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, categoryId]);
    } else {
      setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedCategories.length) return;

    try {
      const { error } = await supabase
        .from("accounting_categories")
        .delete()
        .in("id", selectedCategories);

      if (error) throw error;

      toast.success(`Successfully deleted ${selectedCategories.length} categories`);
      setSelectedCategories([]);
    } catch (error) {
      console.error("Error deleting categories:", error);
      toast.error("Failed to delete categories");
    }
  };

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

      {selectedCategories.length > 0 && (
        <div className="flex items-center gap-2">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleBulkDelete}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Selected ({selectedCategories.length})
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <CategoryTableHeader
              onSelectAll={handleSelectAll}
              allSelected={
                filteredCategories?.length === selectedCategories.length &&
                filteredCategories?.length > 0
              }
            />
            <TableBody>
              {filteredCategories?.map((category) => (
                <CategoryTableRow
                  key={category.id}
                  category={category}
                  isSelected={selectedCategories.includes(category.id)}
                  onSelect={(checked) => handleSelectCategory(category.id, checked)}
                  onEdit={() => {
                    setEditingCategory(category);
                    setShowDialog(true);
                  }}
                  onDelete={() => handleDelete(category.id)}
                />
              ))}
              {!filteredCategories?.length && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
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
        editCategory={editingCategory}
      />
    </div>
  );
};
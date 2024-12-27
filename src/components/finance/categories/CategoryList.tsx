import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CategoryDialog } from "./CategoryDialog";
import { CategoryTableHeader } from "./components/CategoryTableHeader";
import { CategoryTableRow } from "./components/CategoryTableRow";
import { Table, TableBody } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [showDialog, setShowDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accounting_categories")
        .select("*");

      if (error) {
        toast.error("Failed to load categories");
        throw error;
      }

      return data as Category[];
    },
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked && categories) {
      setSelectedCategories(new Set(categories.map(cat => cat.id)));
    } else {
      setSelectedCategories(new Set());
    }
  };

  const handleSelect = (categoryId: string, checked: boolean) => {
    const newSelected = new Set(selectedCategories);
    if (checked) {
      newSelected.add(categoryId);
    } else {
      newSelected.delete(categoryId);
    }
    setSelectedCategories(newSelected);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setShowDialog(true);
  };

  const handleDelete = async (categoryId: string) => {
    try {
      const { error } = await supabase
        .from("accounting_categories")
        .delete()
        .eq("id", categoryId);

      if (error) throw error;
      toast.success("Category deleted successfully");
    } catch (error) {
      toast.error("Failed to delete category");
      console.error("Error deleting category:", error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Categories</h2>
        <Button onClick={() => setShowDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      <Table>
        <CategoryTableHeader 
          onSelectAll={handleSelectAll}
          allSelected={categories ? selectedCategories.size === categories.length : false}
        />
        <TableBody>
          {categories?.map((category) => (
            <CategoryTableRow
              key={category.id}
              category={category}
              isSelected={selectedCategories.has(category.id)}
              onSelect={(checked) => handleSelect(category.id, checked)}
              onEdit={() => handleEdit(category)}
              onDelete={() => handleDelete(category.id)}
            />
          ))}
        </TableBody>
      </Table>

      <CategoryDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        editCategory={editingCategory || undefined}
      />
    </div>
  );
};
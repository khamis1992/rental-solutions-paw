import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CategoryDialog } from "./CategoryDialog";
import { CategoryTableHeader } from "./components/CategoryTableHeader";
import { CategoryTableRow } from "./components/CategoryTableRow";
import { toast } from "sonner";

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

interface CategoryTableHeaderProps {
  onSelectAll: (checked: boolean) => void;
  allSelected: boolean;
}

export function CategoryList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCategories(categories.map((category) => category.id));
    } else {
      setSelectedCategories([]);
    }
  };

  const handleSelectCategory = (categoryId: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, categoryId]);
    } else {
      setSelectedCategories(selectedCategories.filter((id) => id !== categoryId));
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setShowDialog(true);
  };

  const handleDelete = async (categoryId: string) => {
    try {
      // Delete logic here
      toast.success("Category deleted successfully");
      setCategories(categories.filter((category) => category.id !== categoryId));
    } catch (error) {
      toast.error("Failed to delete category");
    }
  };

  const handleBulkDelete = async () => {
    try {
      // Bulk delete logic here
      toast.success("Categories deleted successfully");
      setCategories(
        categories.filter((category) => !selectedCategories.includes(category.id))
      );
      setSelectedCategories([]);
    } catch (error) {
      toast.error("Failed to delete categories");
    }
  };

  useEffect(() => {
    // Fetch categories logic here
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Categories</h2>
        <div className="space-x-2">
          {selectedCategories.length > 0 && (
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
              className="mr-2"
            >
              Delete Selected
            </Button>
          )}
          <Button onClick={() => setShowDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
        </div>
      </div>

      <div className="border rounded-lg">
        <table className="w-full">
          <CategoryTableHeader
            onSelectAll={handleSelectAll}
            allSelected={
              categories.length > 0 &&
              selectedCategories.length === categories.length
            }
          />
          <tbody>
            {categories.map((category) => (
              <CategoryTableRow
                key={category.id}
                category={category}
                selected={selectedCategories.includes(category.id)}
                onSelect={handleSelectCategory}
                onEdit={() => handleEdit(category)}
                onDelete={() => handleDelete(category.id)}
              />
            ))}
          </tbody>
        </table>
      </div>

      <CategoryDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        editCategory={editingCategory || undefined}
      />
    </div>
  );
}
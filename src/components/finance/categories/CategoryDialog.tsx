import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { CategoryForm } from "./form/CategoryForm";

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editCategory?: {
    id: string;
    name: string;
    type: string;
    description: string;
    budget_limit: number | null;
    parent_id: string | null;
    budget_period: string | null;
    is_active?: boolean;
  };
}

export const CategoryDialog = ({ open, onOpenChange, editCategory }: CategoryDialogProps) => {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: any) => {
    setIsSubmitting(true);

    try {
      if (editCategory) {
        const { error } = await supabase
          .from("accounting_categories")
          .update({
            name: formData.name,
            type: formData.type,
            description: formData.description,
            budget_limit: formData.budget_limit ? Number(formData.budget_limit) : null,
            budget_period: formData.budget_period || null,
            is_active: formData.is_active,
            parent_id: formData.parent_id || null,
          })
          .eq("id", editCategory.id);

        if (error) throw error;
        toast.success("Category updated successfully");
      } else {
        const { error } = await supabase.from("accounting_categories").insert([{
          name: formData.name,
          type: formData.type,
          description: formData.description,
          budget_limit: formData.budget_limit ? Number(formData.budget_limit) : null,
          budget_period: formData.budget_period || null,
          is_active: formData.is_active,
          parent_id: formData.parent_id || null,
        }]);

        if (error) throw error;
        toast.success("Category created successfully");
      }

      queryClient.invalidateQueries({ queryKey: ["categories"] });
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error(editCategory ? "Failed to update category" : "Failed to create category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formattedEditCategory = editCategory ? {
    ...editCategory,
    budget_limit: editCategory.budget_limit?.toString() || ''
  } : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editCategory ? "Edit Category" : "Add Category"}</DialogTitle>
        </DialogHeader>
        <CategoryForm
          defaultValues={formattedEditCategory}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};
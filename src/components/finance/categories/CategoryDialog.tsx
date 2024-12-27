import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

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
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    description: "",
    budget_limit: "",
    budget_period: "",
    is_active: true,
    parent_id: "",
  });

  useEffect(() => {
    if (editCategory) {
      setFormData({
        name: editCategory.name,
        type: editCategory.type,
        description: editCategory.description || "",
        budget_limit: editCategory.budget_limit?.toString() || "",
        budget_period: editCategory.budget_period || "",
        is_active: editCategory.is_active ?? true,
        parent_id: editCategory.parent_id || "",
      });
    } else {
      setFormData({
        name: "",
        type: "",
        description: "",
        budget_limit: "",
        budget_period: "",
        is_active: true,
        parent_id: "",
      });
    }
  }, [editCategory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        const { error } = await supabase.from("accounting_categories").insert([
          {
            name: formData.name,
            type: formData.type,
            description: formData.description,
            budget_limit: formData.budget_limit ? Number(formData.budget_limit) : null,
            budget_period: formData.budget_period || null,
            is_active: formData.is_active,
            parent_id: formData.parent_id || null,
          },
        ]);

        if (error) throw error;
        toast.success("Category created successfully");
      }

      queryClient.invalidateQueries({ queryKey: ["categories"] });
      onOpenChange(false);
      setFormData({
        name: "",
        type: "",
        description: "",
        budget_limit: "",
        budget_period: "",
        is_active: true,
        parent_id: "",
      });
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error(editCategory ? "Failed to update category" : "Failed to create category");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editCategory ? "Edit Category" : "Add Category"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value) =>
                setFormData({ ...formData, type: value })
              }
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INCOME">Income</SelectItem>
                <SelectItem value="EXPENSE">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget_limit">Budget Limit</Label>
            <Input
              id="budget_limit"
              type="number"
              value={formData.budget_limit}
              onChange={(e) =>
                setFormData({ ...formData, budget_limit: e.target.value })
              }
              placeholder="Optional"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget_period">Budget Period</Label>
            <Select
              value={formData.budget_period}
              onValueChange={(value) =>
                setFormData({ ...formData, budget_period: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, is_active: checked })
              }
            />
            <Label htmlFor="is_active">Active</Label>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (editCategory ? "Updating..." : "Creating...") : (editCategory ? "Update Category" : "Create Category")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
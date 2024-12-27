import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
    is_active: boolean;
  };
}

export function CategoryDialog({ open, onOpenChange, editCategory }: CategoryDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    type: "expense",
    description: "",
    budget_limit: "",
    budget_period: "monthly",
    is_active: true,
  });

  useEffect(() => {
    if (editCategory) {
      setFormData({
        name: editCategory.name,
        type: editCategory.type,
        description: editCategory.description,
        budget_limit: editCategory.budget_limit?.toString() || "",
        budget_period: editCategory.budget_period || "monthly",
        is_active: editCategory.is_active,
      });
    }
  }, [editCategory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Submit logic here
      toast.success(
        editCategory ? "Category updated successfully" : "Category created successfully"
      );
      onOpenChange(false);
    } catch (error) {
      toast.error(
        editCategory ? "Failed to update category" : "Failed to create category"
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editCategory ? "Edit Category" : "Create Category"}
          </DialogTitle>
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
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
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
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editCategory ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
import { useForm } from "react-hook-form";
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

interface CategoryFormData {
  name: string;
  type: string;
  description: string;
  budget_limit: string;
  budget_period: string;
  is_active: boolean;
  parent_id: string;
}

interface CategoryFormProps {
  defaultValues?: Partial<CategoryFormData>;
  isSubmitting: boolean;
  onSubmit: (data: CategoryFormData) => void;
  onCancel: () => void;
}

export const CategoryForm = ({
  defaultValues,
  isSubmitting,
  onSubmit,
  onCancel,
}: CategoryFormProps) => {
  const { register, handleSubmit, setValue, watch } = useForm<CategoryFormData>({
    defaultValues: {
      name: "",
      type: "",
      description: "",
      budget_limit: "",
      budget_period: "",
      is_active: true,
      parent_id: "",
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          {...register("name", { required: true })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Type</Label>
        <Select
          value={watch("type")}
          onValueChange={(value) => setValue("type", value)}
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
          {...register("description")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="budget_limit">Budget Limit</Label>
        <Input
          id="budget_limit"
          type="number"
          {...register("budget_limit")}
          placeholder="Optional"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="budget_period">Budget Period</Label>
        <Select
          value={watch("budget_period")}
          onValueChange={(value) => setValue("budget_period", value)}
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
          checked={watch("is_active")}
          onCheckedChange={(checked) => setValue("is_active", checked)}
        />
        <Label htmlFor="is_active">Active</Label>
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Category"}
        </Button>
      </div>
    </form>
  );
};
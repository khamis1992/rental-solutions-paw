import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UseFormRegister } from "react-hook-form";
import { TransactionFormData } from "../types/transaction.types";

interface CostTypeSelectProps {
  register: UseFormRegister<TransactionFormData>;
}

export function CostTypeSelect({ register }: CostTypeSelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="cost_type">Cost Type</Label>
      <Select {...register("cost_type")} required>
        <SelectTrigger>
          <SelectValue placeholder="Select cost type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="fixed">Fixed Cost (Monthly Recurring)</SelectItem>
          <SelectItem value="variable">Variable Cost (One-time)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
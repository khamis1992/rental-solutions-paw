import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface CustomerSelectProps {
  register: any;
}

export const CustomerSelect = ({ register }: CustomerSelectProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="customerId">Customer</Label>
      <Select {...register("customerId")}>
        <SelectTrigger>
          <SelectValue placeholder="Select customer" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1">John Doe</SelectItem>
          <SelectItem value="2">Jane Smith</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
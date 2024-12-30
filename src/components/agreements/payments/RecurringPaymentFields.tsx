import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Controller } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RecurringPaymentFieldsProps {
  register: any;
  control: any;
  errors: any;
}

export const RecurringPaymentFields = ({
  register,
  control,
  errors
}: RecurringPaymentFieldsProps) => {
  return (
    <div className="flex space-x-4">
      <div className="flex-1">
        <Label htmlFor="intervalValue">Repeat Every</Label>
        <Input
          id="intervalValue"
          type="number"
          min="1"
          {...register("intervalValue", { 
            required: "Interval value is required",
            min: { value: 1, message: "Interval must be at least 1" }
          })}
          aria-invalid={errors.intervalValue ? "true" : "false"}
        />
        {errors.intervalValue && (
          <p className="text-sm text-red-500 mt-1">{errors.intervalValue.message}</p>
        )}
      </div>
      <div className="flex-1">
        <Label htmlFor="intervalUnit">Unit</Label>
        <Controller
          name="intervalUnit"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="days">Days</SelectItem>
                <SelectItem value="weeks">Weeks</SelectItem>
                <SelectItem value="months">Months</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        {errors.intervalUnit && (
          <p className="text-sm text-red-500 mt-1">{errors.intervalUnit.message}</p>
        )}
      </div>
    </div>
  );
};
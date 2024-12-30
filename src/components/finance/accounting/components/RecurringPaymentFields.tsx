import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RecurringPaymentFieldsProps {
  intervalValue: string;
  intervalUnit: string;
  onIntervalValueChange: (value: string) => void;
  onIntervalUnitChange: (value: string) => void;
}

export function RecurringPaymentFields({
  intervalValue,
  intervalUnit,
  onIntervalValueChange,
  onIntervalUnitChange,
}: RecurringPaymentFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="intervalValue">Repeat Every</Label>
        <Input
          id="intervalValue"
          type="number"
          min="1"
          value={intervalValue}
          onChange={(e) => onIntervalValueChange(e.target.value)}
          aria-label="Interval value"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="intervalUnit">Unit</Label>
        <Select value={intervalUnit} onValueChange={onIntervalUnitChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select unit" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="days">Days</SelectItem>
            <SelectItem value="weeks">Weeks</SelectItem>
            <SelectItem value="months">Months</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
}
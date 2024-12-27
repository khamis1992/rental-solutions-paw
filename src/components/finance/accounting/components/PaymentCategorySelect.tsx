import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PaymentCategorySelectProps {
  value?: string;
  onChange: (value: string) => void;
}

export function PaymentCategorySelect({ value, onChange }: PaymentCategorySelectProps) {
  return (
    <Select value={value} onValueChange={onChange} required>
      <SelectTrigger>
        <SelectValue placeholder="Select category" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="LATE_PAYMENT_FEE">Late Payment Fee</SelectItem>
        <SelectItem value="ADMINISTRATIVE_FEES">Administrative Fees</SelectItem>
        <SelectItem value="VEHICLE_DAMAGE_CHARGE">Vehicle Damage Charge</SelectItem>
        <SelectItem value="TRAFFIC_FINE">Traffic Fine</SelectItem>
        <SelectItem value="RENTAL_FEE">Rental Fee</SelectItem>
        <SelectItem value="ADVANCE_PAYMENT">Advance Payment</SelectItem>
        <SelectItem value="OTHER">Other</SelectItem>
      </SelectContent>
    </Select>
  );
}
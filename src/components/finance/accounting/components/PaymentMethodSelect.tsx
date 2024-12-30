import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PaymentMethodType } from "@/types/database/agreement.types";

interface PaymentMethodSelectProps {
  value?: PaymentMethodType;
  onChange: (value: PaymentMethodType) => void;
}

export function PaymentMethodSelect({ value, onChange }: PaymentMethodSelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select payment method" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="Cash">Cash</SelectItem>
        <SelectItem value="WireTransfer">Wire Transfer</SelectItem>
        <SelectItem value="Invoice">Invoice</SelectItem>
        <SelectItem value="On_hold">On Hold</SelectItem>
        <SelectItem value="Deposit">Deposit</SelectItem>
        <SelectItem value="Cheque">Cheque</SelectItem>
      </SelectContent>
    </Select>
  );
}
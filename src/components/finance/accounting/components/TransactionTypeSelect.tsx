import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TransactionType } from "../types/transaction.types";

interface TransactionTypeSelectProps {
  value?: TransactionType;
  onChange: (value: TransactionType) => void;
}

export function TransactionTypeSelect({ value, onChange }: TransactionTypeSelectProps) {
  return (
    <Select value={value} onValueChange={onChange} required>
      <SelectTrigger>
        <SelectValue placeholder="Select type" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="INCOME">Income</SelectItem>
        <SelectItem value="EXPENSE">Expense</SelectItem>
      </SelectContent>
    </Select>
  );
}
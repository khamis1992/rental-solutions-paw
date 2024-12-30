import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";

interface CaseFinancialInfoProps {
  form: UseFormReturn<any>;
}

export const CaseFinancialInfo = ({ form }: CaseFinancialInfoProps) => {
  return (
    <FormField
      control={form.control}
      name="amount_owed"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Amount Owed</FormLabel>
          <FormControl>
            <Input type="number" step="0.01" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
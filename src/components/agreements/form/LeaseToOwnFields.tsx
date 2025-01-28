import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";

interface LeaseToOwnFieldsProps {
  register: any;
  watch: any;
}

export const LeaseToOwnFields = ({ register, watch }: LeaseToOwnFieldsProps) => {
  const totalAmount = watch('rentAmount') || 0;
  const downPayment = watch('downPayment') || 0;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Lease-to-Own Details</h3>
      <div className="grid grid-cols-2 gap-4">
        <FormField
          name="downPayment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Down Payment (QAR)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Enter down payment amount"
                  {...register("downPayment")}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
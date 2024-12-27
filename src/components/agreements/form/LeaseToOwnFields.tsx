import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LeaseToOwnFieldsProps {
  register: any;
  watch: (name: string) => any;
}

export const LeaseToOwnFields = ({ register, watch }: LeaseToOwnFieldsProps) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="downPayment">Down Payment</Label>
        <Input
          type="number"
          step="0.01"
          placeholder="0.00"
          {...register("downPayment")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="monthlyPayment">Monthly Payment</Label>
        <Input
          type="number"
          step="0.01"
          placeholder="0.00"
          {...register("monthlyPayment")}
        />
      </div>
    </>
  );
};
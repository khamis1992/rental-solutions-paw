import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LeaseToOwnFieldsProps {
  register: any;
  updateMonthlyPayment: () => void;
  watch: (name: string) => any;
}

export const LeaseToOwnFields = ({ register, updateMonthlyPayment, watch }: LeaseToOwnFieldsProps) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="downPayment">Down Payment</Label>
        <Input
          type="number"
          step="0.01"
          placeholder="0.00"
          {...register("downPayment")}
          onChange={(e) => {
            register("downPayment").onChange(e);
            updateMonthlyPayment();
          }}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="monthlyPayment">Monthly Payment</Label>
        <Input
          type="number"
          step="0.01"
          placeholder="0.00"
          {...register("monthlyPayment")}
          readOnly
          value={watch("monthlyPayment") || ""}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="interestRate">Interest Rate (%)</Label>
        <Input
          type="number"
          step="0.01"
          placeholder="0.00"
          {...register("interestRate")}
          onChange={(e) => {
            register("interestRate").onChange(e);
            updateMonthlyPayment();
          }}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="leaseDuration">Lease Duration (months)</Label>
        <Input
          type="number"
          placeholder="12"
          {...register("leaseDuration")}
          onChange={(e) => {
            register("leaseDuration").onChange(e);
            updateMonthlyPayment();
          }}
        />
      </div>
    </>
  );
};
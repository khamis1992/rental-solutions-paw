import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LeaseToOwnFieldsProps {
  register: any;
  watch: any;
}

export const LeaseToOwnFields = ({ register, watch }: LeaseToOwnFieldsProps) => {
  const totalAmount = watch('rentAmount') || 0;
  const downPayment = watch('downPayment') || 0;
  const interestRate = watch('interestRate') || 0;
  const leaseDuration = watch('agreementDuration') || 12;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Lease-to-Own Details</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="downPayment">Down Payment</Label>
          <Input
            id="downPayment"
            type="number"
            step="0.01"
            {...register("downPayment")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="interestRate">Interest Rate (%)</Label>
          <Input
            id="interestRate"
            type="number"
            step="0.01"
            {...register("interestRate")}
          />
        </div>
      </div>
    </div>
  );
};
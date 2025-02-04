import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UseFormRegister, UseFormWatch } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { AgreementFormData } from "../hooks/useAgreementForm";

interface LeaseToOwnFieldsProps {
  register: UseFormRegister<AgreementFormData>;
  watch: UseFormWatch<AgreementFormData>;
}

export const LeaseToOwnFields = ({ register, watch }: LeaseToOwnFieldsProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Lease to Own Details</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="finalPrice">Final Price (QAR)</Label>
          <Input
            id="finalPrice"
            type="number"
            step="0.01"
            placeholder="Enter final price"
            {...register("finalPrice", {
              setValueAs: (v: string) => v === "" ? 0 : parseFloat(v),
            })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="downPayment">Down Payment (QAR)</Label>
          <Input
            id="downPayment"
            type="number"
            step="0.01"
            placeholder="Enter down payment amount"
            {...register("downPayment", {
              setValueAs: (v: string) => v === "" ? 0 : parseFloat(v),
              min: {
                value: 0,
                message: "Down payment cannot be negative"
              }
            })}
          />
        </div>
      </div>
    </div>
  );
};
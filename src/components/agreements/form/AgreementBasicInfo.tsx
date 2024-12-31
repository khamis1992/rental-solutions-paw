import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { AgreementFormData } from "../hooks/useAgreementForm";
import { AgreementTypeSelect } from "./AgreementTypeSelect";

interface AgreementBasicInfoProps {
  register: UseFormRegister<AgreementFormData>;
  errors: FieldErrors<AgreementFormData>;
}

export const AgreementBasicInfo = ({ register, errors }: AgreementBasicInfoProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Basic Agreement Information</h3>
      <div className="grid grid-cols-2 gap-4">
        {/* Agreement Number - Read Only */}
        <div className="space-y-2">
          <Label htmlFor="agreementNumber">Agreement No.</Label>
          <Input
            id="agreementNumber"
            {...register("agreementNumber")}
            readOnly
            className="bg-gray-100"
          />
        </div>

        <AgreementTypeSelect register={register} />

        <div className="space-y-2">
          <Label htmlFor="rentAmount">Rent Amount</Label>
          <Input
            id="rentAmount"
            type="number"
            step="0.01"
            {...register("rentAmount", { required: "Rent amount is required" })}
          />
          {errors.rentAmount && (
            <span className="text-sm text-red-500">{errors.rentAmount.message}</span>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="finalPrice">Final Price</Label>
          <Input
            id="finalPrice"
            type="number"
            step="0.01"
            {...register("finalPrice", { required: "Final price is required" })}
          />
          {errors.finalPrice && (
            <span className="text-sm text-red-500">{errors.finalPrice.message}</span>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="agreementDuration">Agreement Duration (months)</Label>
          <Input
            id="agreementDuration"
            type="number"
            {...register("agreementDuration", { required: "Duration is required" })}
          />
          {errors.agreementDuration && (
            <span className="text-sm text-red-500">{errors.agreementDuration.message}</span>
          )}
        </div>
      </div>
    </div>
  );
};
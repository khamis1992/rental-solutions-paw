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
      </div>
    </div>
  );
};
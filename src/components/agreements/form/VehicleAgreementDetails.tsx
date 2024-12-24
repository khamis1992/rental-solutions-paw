import { UseFormRegister, UseFormWatch, UseFormSetValue } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AgreementFormData } from "../AgreementForm";

interface VehicleAgreementDetailsProps {
  register: UseFormRegister<AgreementFormData>;
  errors: any;
  watch: UseFormWatch<AgreementFormData>;
  setValue: UseFormSetValue<AgreementFormData>;
}

export const VehicleAgreementDetails = ({
  register,
  errors,
  watch,
  setValue,
}: VehicleAgreementDetailsProps) => {
  const agreementType = watch("agreementType");

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Vehicle Agreement Details</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="initialMileage">Initial Mileage</Label>
          <Input
            id="initialMileage"
            type="number"
            {...register("initialMileage", { required: true })}
          />
          {errors.initialMileage && (
            <span className="text-sm text-red-500">This field is required</span>
          )}
        </div>

        {agreementType === 'short_term' && (
          <div>
            <Label htmlFor="rentAmount">Recurring Payment (QAR)</Label>
            <Input
              id="rentAmount"
              type="number"
              {...register("rentAmount", { required: true })}
            />
            {errors.rentAmount && (
              <span className="text-sm text-red-500">This field is required</span>
            )}
          </div>
        )}

        {agreementType === 'lease_to_own' && (
          <>
            <div>
              <Label htmlFor="downPayment">Down Payment (QAR)</Label>
              <Input
                id="downPayment"
                type="number"
                {...register("downPayment", { required: true })}
              />
              {errors.downPayment && (
                <span className="text-sm text-red-500">This field is required</span>
              )}
            </div>

            <div>
              <Label htmlFor="monthlyPayment">Monthly Payment (QAR)</Label>
              <Input
                id="monthlyPayment"
                type="number"
                {...register("monthlyPayment", { required: true })}
              />
              {errors.monthlyPayment && (
                <span className="text-sm text-red-500">This field is required</span>
              )}
            </div>

            <div>
              <Label htmlFor="agreementDuration">Duration (months)</Label>
              <Input
                id="agreementDuration"
                type="number"
                {...register("agreementDuration", { required: true })}
              />
              {errors.agreementDuration && (
                <span className="text-sm text-red-500">This field is required</span>
              )}
            </div>

            <div>
              <Label htmlFor="interestRate">Interest Rate (%)</Label>
              <Input
                id="interestRate"
                type="number"
                step="0.01"
                {...register("interestRate", { required: true })}
              />
              {errors.interestRate && (
                <span className="text-sm text-red-500">This field is required</span>
              )}
            </div>
          </>
        )}

        <div>
          <Label htmlFor="notes">Notes</Label>
          <Input
            id="notes"
            type="text"
            {...register("notes")}
          />
        </div>
      </div>
    </div>
  );
};
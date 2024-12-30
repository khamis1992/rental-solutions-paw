import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from "react-hook-form";
import { AgreementFormData } from "../hooks/useAgreementForm";
import { VehicleSelect } from "./VehicleSelect";

interface VehicleAgreementDetailsProps {
  register: UseFormRegister<AgreementFormData>;
  errors: FieldErrors<AgreementFormData>;
  watch: UseFormWatch<AgreementFormData>;
  setValue: UseFormSetValue<AgreementFormData>;
}

export const VehicleAgreementDetails = ({ 
  register, 
  errors,
  watch,
  setValue 
}: VehicleAgreementDetailsProps) => {
  const handleVehicleSelect = (vehicleId: string) => {
    setValue('vehicleId', vehicleId);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Vehicle & Agreement Details</h3>
      <div className="grid grid-cols-2 gap-4">
        <VehicleSelect register={register} onVehicleSelect={handleVehicleSelect} />

        <div className="space-y-2">
          <Label htmlFor="initialMileage">Initial Mileage</Label>
          <Input
            type="number"
            {...register("initialMileage", { required: "Initial mileage is required" })}
            placeholder="Enter initial mileage"
          />
          {errors.initialMileage && (
            <span className="text-sm text-red-500">{errors.initialMileage.message}</span>
          )}
        </div>
      </div>
    </div>
  );
};
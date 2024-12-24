import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { AgreementBasicInfo } from "./form/AgreementBasicInfo";
import { CustomerInformation } from "./form/CustomerInformation";
import { VehicleAgreementDetails } from "./form/VehicleAgreementDetails";
import { useState } from "react";

export interface AgreementFormData {
  agreementNumber?: string;
  agreementType: 'lease_to_own' | 'short_term';
  customerId: string;
  vehicleId: string;
  nationality: string;
  drivingLicense: string;
  phoneNumber: string;
  email: string;
  address: string;
  startDate: Date;
  endDate: Date;
  agreementDuration: number;
  downPayment: number;
  monthlyPayment: number;
  interestRate: number;
  lateFeeRate: number;
  lateReturnFee: number;
  notes?: string;
  rentAmount: number;
  initialMileage: number;
  total_amount: number;
}

interface AgreementFormProps {
  onSubmit: (data: Partial<AgreementFormData>) => void;
  onCancel: () => void;
}

export const AgreementForm = ({ onSubmit, onCancel }: AgreementFormProps) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<AgreementFormData>();

  const handleFormSubmit = (data: AgreementFormData) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      <AgreementBasicInfo register={register} errors={errors} />
      
      <CustomerInformation 
        register={register}
        errors={errors}
        selectedCustomerId={selectedCustomerId}
        onCustomerSelect={setSelectedCustomerId}
        setValue={setValue}
      />
      
      <VehicleAgreementDetails 
        register={register}
        errors={errors}
        watch={watch}
        setValue={setValue}
      />

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Create Agreement
        </Button>
      </div>
    </form>
  );
};
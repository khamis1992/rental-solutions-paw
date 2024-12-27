import { CustomerSelect } from "./CustomerSelect";
import { UseFormRegister, FieldErrors, UseFormSetValue } from "react-hook-form";
import { AgreementFormData } from "../hooks/useAgreementForm";

interface CustomerInformationProps {
  register: UseFormRegister<AgreementFormData>;
  errors: FieldErrors<AgreementFormData>;
  selectedCustomerId: string;
  onCustomerSelect: (customerId: string) => void;
  setValue: UseFormSetValue<AgreementFormData>;
}

export const CustomerInformation = ({
  register,
  errors,
  selectedCustomerId,
  onCustomerSelect,
  setValue
}: CustomerInformationProps) => {
  const handleCustomerSelect = (customerId: string) => {
    setValue('customerId', customerId);
    onCustomerSelect(customerId);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Customer Information</h3>
      <div className="grid grid-cols-1 gap-4">
        <CustomerSelect 
          register={register} 
          onCustomerSelect={handleCustomerSelect}
        />
        {errors.customerId && (
          <span className="text-sm text-red-500">{errors.customerId.message}</span>
        )}
      </div>
    </div>
  );
};
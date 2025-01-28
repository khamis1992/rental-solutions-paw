import { useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AgreementFormData {
  address: string;
  email: string;
  notes: string;
  nationality: string;
  vehicleId: string;
  customerId: string;
  rentAmount: number;
  agreementType: string;
  initialMileage: number;
  agreementNumber: string;
  drivingLicense: string;
  phoneNumber: string;
  fullName: string;
  startDate: string;
  endDate: string;
  dailyLateFee: number;
  damagePenaltyRate: number;
  lateReturnFee: number;
  agreementDuration: number;
  finalPrice: number;
  downPayment?: number;
}

export const useAgreementForm = (onSuccess: () => void) => {
  const [open, setOpen] = useState(false);
  const [agreementType, setAgreementType] = useState<string>("short_term");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AgreementFormData>({
    defaultValues: {
      agreementType: "short_term",
      rentAmount: 0,
      dailyLateFee: 120,
      damagePenaltyRate: 0,
      lateReturnFee: 0,
      agreementDuration: 12,
      finalPrice: 0,
      downPayment: 0
    }
  });

  const onSubmit = async (data: AgreementFormData) => {
    try {
      const { error } = await supabase
        .from('leases')
        .insert({
          ...data,
          status: 'pending_payment',
          down_payment: data.downPayment || 0
        });

      if (error) throw error;
      
      console.log("Agreement created successfully");
      onSuccess();
      toast.success("Agreement created successfully");
    } catch (error) {
      console.error("Error creating agreement:", error);
      toast.error("Failed to create agreement");
      throw error;
    }
  };

  return {
    open,
    setOpen,
    register,
    handleSubmit,
    onSubmit,
    agreementType,
    watch,
    setValue,
    errors,
  };
};
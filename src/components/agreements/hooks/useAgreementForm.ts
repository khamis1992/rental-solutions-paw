import { useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LeaseStatus } from "@/types/agreement.types";

export interface AgreementFormData {
  address: string;
  email: string;
  notes: string;
  nationality: string;
  vehicleId: string;
  customerId: string;
  rentAmount: number;
  agreementType: "lease_to_own" | "short_term";
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
      // Format the data to match the database schema
      const formattedData = {
        customer_id: data.customerId,
        vehicle_id: data.vehicleId,
        agreement_type: data.agreementType,
        rent_amount: Number(data.rentAmount) || 0,
        total_amount: Number(data.finalPrice) || 0,
        initial_mileage: Number(data.initialMileage) || 0,
        agreement_duration: `${data.agreementDuration} months`,
        start_date: data.startDate,
        end_date: data.endDate,
        daily_late_fee: Number(data.dailyLateFee) || 120,
        damage_penalty_rate: Number(data.damagePenaltyRate) || 0,
        late_return_fee: Number(data.lateReturnFee) || 0,
        down_payment: Number(data.downPayment) || 0,
        notes: data.notes,
        status: 'pending_payment' as LeaseStatus
      };

      const { error } = await supabase
        .from('leases')
        .insert(formattedData);

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
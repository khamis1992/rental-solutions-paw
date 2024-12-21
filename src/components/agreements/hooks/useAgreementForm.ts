import { useState } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { calculateMonthlyPayment } from "../utils/paymentCalculations";
import { Agreement, AgreementType } from "@/types/database/agreement.types";

export interface AgreementFormData {
  agreementType: AgreementType;
  customerId: string;
  vehicleId: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  initialMileage: number;
  downPayment?: number;
  monthlyPayment?: number;
  interestRate?: number;
  leaseDuration?: string;
  notes?: string;
  lateFeeRate?: number;
  lateFeeGracePeriod?: number;
  damagePenaltyRate?: number;
  fuelPenaltyRate?: number;
  lateReturnFee?: number;
}

export const useAgreementForm = (onSuccess: () => void) => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { register, handleSubmit, watch, reset, setValue } = useForm<AgreementFormData>();
  
  const agreementType = watch("agreementType");
  const totalAmount = watch("totalAmount");
  const downPayment = watch("downPayment");
  const interestRate = watch("interestRate");
  const leaseDuration = watch("leaseDuration");

  const updateMonthlyPayment = () => {
    if (agreementType === "lease_to_own" && totalAmount && leaseDuration) {
      const monthlyPayment = calculateMonthlyPayment(
        totalAmount,
        downPayment || 0,
        interestRate || 0,
        Number(leaseDuration)
      );
      setValue("monthlyPayment", monthlyPayment);
    }
  };

  const onSubmit = async (data: AgreementFormData) => {
    try {
      if (data.agreementType === "lease_to_own") {
        updateMonthlyPayment();
      }

      const { error } = await supabase.from("leases").insert({
        agreement_type: data.agreementType,
        customer_id: data.customerId,
        vehicle_id: data.vehicleId,
        start_date: data.startDate,
        end_date: data.endDate,
        total_amount: data.totalAmount,
        initial_mileage: data.initialMileage,
        down_payment: data.downPayment,
        monthly_payment: data.monthlyPayment,
        interest_rate: data.interestRate,
        lease_duration: data.leaseDuration,
        notes: data.notes,
        late_fee_rate: data.lateFeeRate,
        late_fee_grace_period: `${data.lateFeeGracePeriod} days`,
        damage_penalty_rate: data.damagePenaltyRate,
        fuel_penalty_rate: data.fuelPenaltyRate,
        late_return_fee: data.lateReturnFee,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Agreement created successfully",
      });
      setOpen(false);
      reset();
      onSuccess();
    } catch (error) {
      console.error("Error creating agreement:", error);
      toast({
        title: "Error",
        description: "Failed to create agreement",
        variant: "destructive",
      });
    }
  };

  return {
    open,
    setOpen,
    register,
    handleSubmit,
    onSubmit,
    agreementType,
    updateMonthlyPayment,
    watch,
    setValue,
  };
};

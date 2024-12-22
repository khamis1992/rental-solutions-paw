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

      // Convert empty strings to null or 0 for numeric fields
      const numericFields = {
        total_amount: data.totalAmount || 0,
        initial_mileage: data.initialMileage || 0,
        down_payment: data.downPayment || null,
        monthly_payment: data.monthlyPayment || null,
        interest_rate: data.interestRate || null,
        late_fee_rate: data.lateFeeRate || 0,
        damage_penalty_rate: data.damagePenaltyRate || 0,
        fuel_penalty_rate: data.fuelPenaltyRate || 0,
        late_return_fee: data.lateReturnFee || 0,
      };

      const { error } = await supabase.from("leases").insert({
        agreement_type: data.agreementType,
        customer_id: data.customerId,
        vehicle_id: data.vehicleId,
        start_date: data.startDate,
        end_date: data.endDate,
        ...numericFields,
        lease_duration: data.leaseDuration ? `${data.leaseDuration} months` : null,
        late_fee_grace_period: data.lateFeeGracePeriod ? `${data.lateFeeGracePeriod} days` : null,
        notes: data.notes || null,
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
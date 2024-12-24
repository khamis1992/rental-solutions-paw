import { useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";

export interface PaymentScheduleItem {
  due_date: string;
  amount: number;
  status: "pending" | "paid" | "overdue";
  lease_id: string;
}

export interface AgreementFormData {
  agreementType: "lease_to_own" | "short_term";
  agreementNumber: string;
  customerId: string;
  vehicleId: string;
  nationality: string;
  drivingLicense: string;
  phoneNumber: string;
  email: string;
  address: string;
  startDate: string;
  endDate: string;
  agreementDuration: number;
  downPayment: number;
  monthlyPayment: number;
  interestRate: number;
  lateFeeRate: number;
  lateReturnFee: number;
  paymentSchedules: PaymentScheduleItem[];
  notes?: string;
  rentAmount: number;
  initialMileage: number;
}

export const useAgreementForm = (onSuccess?: () => void) => {
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AgreementFormData>();

  const agreementType = watch("agreementType");

  const updateMonthlyPayment = (values: Partial<AgreementFormData>) => {
    const totalAmount = Number(values.downPayment || 0);
    const duration = Number(values.agreementDuration || 1);
    const interestRate = Number(values.interestRate || 0) / 100;
    
    if (totalAmount && duration) {
      const monthlyInterest = interestRate / 12;
      const monthlyPayment = duration > 0
        ? (totalAmount * monthlyInterest * Math.pow(1 + monthlyInterest, duration)) /
          (Math.pow(1 + monthlyInterest, duration) - 1)
        : 0;
      
      setValue('monthlyPayment', Math.round(monthlyPayment * 100) / 100);
    }
  };

  const onSubmit = async (data: AgreementFormData) => {
    try {
      const { error: agreementError } = await supabase
        .from("leases")
        .insert({
          agreement_type: data.agreementType,
          agreement_number: data.agreementNumber,
          customer_id: data.customerId,
          vehicle_id: data.vehicleId,
          start_date: data.startDate,
          end_date: data.endDate,
          duration_months: data.agreementDuration,
          down_payment: data.downPayment,
          monthly_payment: data.monthlyPayment,
          interest_rate: data.interestRate,
          late_fee_rate: data.lateFeeRate,
          late_return_fee: data.lateReturnFee,
          status: "active",
          initial_mileage: data.initialMileage,
          rent_amount: data.rentAmount,
          notes: data.notes
        });

      if (agreementError) throw agreementError;

      const { error: vehicleError } = await supabase
        .from("vehicles")
        .update({ status: "rented" })
        .eq("id", data.vehicleId);

      if (vehicleError) throw vehicleError;

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error in form submission:", error);
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
    updateMonthlyPayment,
    watch,
    setValue,
    errors,
  };
};
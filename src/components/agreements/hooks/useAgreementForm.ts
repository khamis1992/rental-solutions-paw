import { useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { addMonths } from "date-fns";
import { toast } from "sonner";
import { AgreementType, LeaseStatus } from "@/types/agreement.types";

export interface AgreementFormData {
  agreementType: AgreementType;
  customerId: string;
  vehicleId: string;
  rentAmount: number;
  agreementDuration: number;
  startDate: string;
  endDate: string;
  dailyLateFee: number;
  notes?: string;
  downPayment?: number;
  // Additional customer fields
  nationality?: string;
  drivingLicense?: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
  // Template fields
  finalPrice?: number;
  agreementNumber?: string;
}

export const useAgreementForm = (onSuccess: () => void) => {
  const [open, setOpen] = useState(false);
  const [agreementType, setAgreementType] = useState<AgreementType>("short_term");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AgreementFormData>({
    defaultValues: {
      agreementType: "short_term",
      startDate: new Date().toISOString().split('T')[0],
      agreementDuration: 12,
      dailyLateFee: 120,
    }
  });

  // Watch for changes in start date and duration
  const startDate = watch('startDate');
  const duration = watch('agreementDuration');

  // Update end date when start date or duration changes
  const updateEndDate = () => {
    if (startDate && duration) {
      try {
        const endDate = addMonths(new Date(startDate), duration);
        setValue('endDate', endDate.toISOString().split('T')[0]);
      } catch (error) {
        console.error('Error calculating end date:', error);
      }
    }
  };

  // Use watch callback to update end date
  watch((data, { name }) => {
    if (name === 'startDate' || name === 'agreementDuration') {
      updateEndDate();
    }
  });

  const onSubmit = async (data: AgreementFormData) => {
    try {
      console.log("Form data before submission:", data);

      if (!data.customerId || data.customerId === "") {
        toast.error("Please select a customer");
        return;
      }

      if (!data.vehicleId || data.vehicleId === "") {
        toast.error("Please select a vehicle");
        return;
      }

      const { error } = await supabase
        .from('leases')
        .insert({
          agreement_type: data.agreementType,
          customer_id: data.customerId,
          vehicle_id: data.vehicleId,
          rent_amount: data.rentAmount,
          total_amount: data.rentAmount * data.agreementDuration,
          start_date: data.startDate,
          end_date: data.endDate,
          daily_late_fee: data.dailyLateFee,
          notes: data.notes,
          down_payment: data.downPayment,
          status: 'pending_payment' as LeaseStatus,
          initial_mileage: 0,
          agreement_duration: `${data.agreementDuration} months`
        });

      if (error) {
        console.error('Error creating agreement:', error);
        toast.error(error.message);
        throw error;
      }

      onSuccess();
      toast.success("Agreement created successfully");
    } catch (error) {
      console.error('Error creating agreement:', error);
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
import { useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { calculateMonthlyPayment } from "../utils/paymentCalculations";

export interface AgreementFormData {
  agreementNumber: string;
  agreementType: "lease_to_own" | "short_term";
  nationality: string;
  drivingLicense: string;
  phoneNumber: string;
  email: string;
  address: string;
  vehicleId: string;
  customerId: string;
  agreementDuration: number;
  rentAmount: number;
  finalPrice: number;
  downPayment?: number;
  initialMileage: number;
  notes?: string;
  interestRate?: number;
  monthlyPayment?: number;
}

export const useAgreementForm = (onSuccess?: () => void) => {
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<AgreementFormData>();
  const [agreementType, setAgreementType] = useState<"lease_to_own" | "short_term">("lease_to_own");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const calculateAndUpdateMonthlyPayment = () => {
    const totalAmount = watch('rentAmount') || 0;
    const downPayment = watch('downPayment') || 0;
    const interestRate = watch('interestRate') || 0;
    const leaseDuration = watch('agreementDuration') || 12;

    const monthlyPayment = calculateMonthlyPayment(
      totalAmount,
      downPayment,
      interestRate,
      leaseDuration
    );

    setValue('monthlyPayment', monthlyPayment);
  };

  const onSubmit = async (data: AgreementFormData) => {
    try {
      console.log('Submitting agreement form with data:', data);
      setIsSubmitting(true);
      
      const { data: agreement, error: agreementError } = await supabase
        .from('leases')
        .insert({
          customer_id: data.customerId,
          vehicle_id: data.vehicleId,
          agreement_type: data.agreementType,
          initial_mileage: data.initialMileage,
          total_amount: data.finalPrice,
          rent_amount: data.rentAmount,
          status: 'pending_payment',
          down_payment: data.downPayment,
          notes: data.notes,
          lease_duration: `${data.agreementDuration} months`
        })
        .select()
        .single();

      if (agreementError) throw agreementError;

      console.log('Created agreement:', agreement);

      const { data: vehicle, error: vehicleError } = await supabase
        .from('vehicles')
        .select('license_plate')
        .eq('id', data.vehicleId)
        .single();

      if (vehicleError) throw vehicleError;

      console.log('Retrieved vehicle:', vehicle);

      if (onSuccess) {
        onSuccess();
      }
      
      toast.success('Agreement created successfully');
      setOpen(false);
    } catch (error) {
      console.error('Error in form submission:', error);
      toast.error('Failed to create agreement');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    register,
    handleSubmit,
    onSubmit,
    agreementType,
    setAgreementType,
    watch,
    setValue,
    errors,
    isSubmitting,
    setIsSubmitting,
    calculateAndUpdateMonthlyPayment,
    open,
    setOpen
  };
};
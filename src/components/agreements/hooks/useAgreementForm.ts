import { useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  downPayment?: number;
  initialMileage: number;
  notes?: string;
}

export const useAgreementForm = (onSuccess?: () => void) => {
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<AgreementFormData>();
  const [agreementType, setAgreementType] = useState<"lease_to_own" | "short_term">("lease_to_own");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [monthlyPayment, setMonthlyPayment] = useState(0);

  const updateMonthlyPayment = (totalAmount: number, duration: number) => {
    if (duration > 0) {
      setMonthlyPayment(totalAmount / duration);
    }
  };

  const onSubmit = async (data: AgreementFormData) => {
    try {
      console.log('Submitting agreement form with data:', data);
      setIsSubmitting(true);
      
      // Insert the agreement
      const { data: agreement, error: agreementError } = await supabase
        .from('leases')
        .insert({
          customer_id: data.customerId,
          vehicle_id: data.vehicleId,
          agreement_type: data.agreementType,
          initial_mileage: data.initialMileage,
          total_amount: data.rentAmount,
          rent_amount: data.rentAmount,
          status: 'pending_payment',
          down_payment: data.downPayment,
          notes: data.notes
        })
        .select()
        .single();

      if (agreementError) throw agreementError;

      console.log('Created agreement:', agreement);

      // Get vehicle details for license plate
      const { data: vehicle, error: vehicleError } = await supabase
        .from('vehicles')
        .select('license_plate')
        .eq('id', data.vehicleId)
        .single();

      if (vehicleError) throw vehicleError;

      console.log('Retrieved vehicle:', vehicle);

      // Create the remaining amount record
      const { error: remainingAmountError } = await supabase
        .from('remaining_amounts')
        .insert({
          agreement_number: agreement.agreement_number,
          license_plate: vehicle.license_plate,
          rent_amount: data.rentAmount,
          final_price: data.rentAmount,
          amount_paid: 0,
          remaining_amount: data.rentAmount,
          agreement_duration: `${data.agreementDuration} months`,
          lease_id: agreement.id
        });

      if (remainingAmountError) {
        console.error('Error creating remaining amount:', remainingAmountError);
        throw remainingAmountError;
      }

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
    monthlyPayment,
    setMonthlyPayment,
    updateMonthlyPayment,
    open,
    setOpen
  };
};
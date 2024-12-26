import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useEffect, useState } from "react";

export const useAgreementForm = (onSuccess?: () => void) => {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm();
  const [agreementType, setAgreementType] = useState("lease_to_own");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [monthlyPayment, setMonthlyPayment] = useState(0);

  const onSubmit = async (data: any) => {
    try {
      console.log('Submitting agreement form with data:', data);
      
      // Insert the agreement
      const { data: agreement, error: agreementError } = await supabase
        .from('leases')
        .insert([{
          ...data,
          total_amount: data.total_amount || data.rent_amount,
          status: 'pending_payment'
        }])
        .select()
        .single();

      if (agreementError) throw agreementError;

      console.log('Agreement created:', agreement);

      // Create the remaining amount record
      const { error: remainingAmountError } = await supabase
        .from('remaining_amounts')
        .insert([{
          agreement_number: agreement.agreement_number,
          license_plate: data.license_plate,
          rent_amount: data.rent_amount || 0,
          final_price: data.total_amount || data.rent_amount || 0,
          amount_paid: 0,
          remaining_amount: data.total_amount || data.rent_amount || 0,
          agreement_duration: data.lease_duration || '12 months',
          lease_id: agreement.id
        }]);

      if (remainingAmountError) {
        console.error('Error creating remaining amount:', remainingAmountError);
        throw remainingAmountError;
      }

      console.log('Remaining amount record created');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error in form submission:', error);
      throw error;
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
  };
};

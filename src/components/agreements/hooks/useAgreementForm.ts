import { useState } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { calculatePayment } from "@/lib/paymentUtils";
import { Agreement, AgreementType } from "@/types/database/agreement.types";

export interface AgreementFormData {
  agreementType: AgreementType;
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
  rentAmount: number;
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
  paymentSchedules?: Array<{
    due_date: string;
    amount: number;
    status: 'pending';
    lease_id: string | null;
  }>;
}

export const useAgreementForm = (onSuccess: () => void) => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { register, handleSubmit, watch, reset, setValue, formState: { errors } } = useForm<AgreementFormData>();
  
  const agreementType = watch("agreementType");
  const totalAmount = watch("totalAmount");
  const downPayment = watch("downPayment");
  const interestRate = watch("interestRate");
  const leaseDuration = watch("leaseDuration");
  const rentAmount = watch("rentAmount");
  const agreementDuration = watch("agreementDuration");

  const updateMonthlyPayment = () => {
    if (agreementType === "lease_to_own" && rentAmount && agreementDuration) {
      try {
        const result = calculatePayment(
          rentAmount,
          interestRate || 0,
          "monthly",
          new Date(),
          Number(agreementDuration)
        );

        // Update the monthly payment and total amount
        setValue("monthlyPayment", result.schedule[0]?.amount || 0);
        setValue("totalAmount", result.totalAmount);

        // Store the payment schedule for later use, converting Date to ISO string
        const paymentSchedules = result.schedule.map(payment => ({
          due_date: payment.dueDate.toISOString(),
          amount: payment.amount,
          status: 'pending' as const,
          lease_id: null
        }));

        // Store in form data for submission
        setValue("paymentSchedules", paymentSchedules);
      } catch (error) {
        console.error("Error calculating payment:", error);
        toast({
          title: "Error calculating payment",
          description: "Please check the entered values and try again.",
          variant: "destructive",
        });
      }
    }
  };

  const onSubmit = async (data: AgreementFormData) => {
    console.log("Submitting agreement data:", data);
    
    try {
      // First, update customer profile with any new information
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          nationality: data.nationality,
          phone_number: data.phoneNumber,
          email: data.email,
          address: data.address,
          driver_license: data.drivingLicense
        })
        .eq("id", data.customerId);

      if (profileError) {
        console.error("Error updating profile:", profileError);
        throw profileError;
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
        rent_amount: data.rentAmount || 0,
      };

      // Create the lease record
      const { data: lease, error: leaseError } = await supabase
        .from("leases")
        .insert({
          agreement_type: data.agreementType,
          customer_id: data.customerId,
          vehicle_id: data.vehicleId,
          start_date: data.startDate,
          end_date: data.endDate,
          ...numericFields,
          lease_duration: data.leaseDuration ? `${data.leaseDuration} months` : null,
          late_fee_grace_period: data.lateFeeGracePeriod ? `${data.lateFeeGracePeriod} days` : null,
          notes: data.notes || null,
        })
        .select()
        .single();

      if (leaseError) {
        console.error("Error creating lease:", leaseError);
        throw leaseError;
      }

      // After successfully creating the lease, create a remaining amount record
      if (lease) {
        const { error: remainingAmountError } = await supabase
          .from('remaining_amounts')
          .insert({
            agreement_number: lease.agreement_number,
            license_plate: data.vehicleId, // This will be updated with the actual license plate
            rent_amount: data.rentAmount || 0,
            final_price: data.totalAmount || 0,
            amount_paid: 0, // Initial amount paid is 0
            remaining_amount: data.totalAmount || 0, // Initially, remaining amount equals total amount
            agreement_duration: `${data.agreementDuration} months`,
            lease_id: lease.id
          });

        if (remainingAmountError) {
          console.error("Error creating remaining amount record:", remainingAmountError);
          toast({
            title: "Warning",
            description: "Agreement created but failed to initialize remaining amount tracking.",
            variant: "destructive",
          });
        }
      }

      reset();
      onSuccess();
    } catch (error: any) {
      console.error("Error in agreement creation:", error);
      throw new Error(error.message || "Failed to create agreement");
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

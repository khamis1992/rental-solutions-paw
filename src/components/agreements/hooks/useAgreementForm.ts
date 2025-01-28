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
  agreementNumber: string;
  drivingLicense: string;
  phoneNumber: string;
  fullName: string;
  startDate: string;
  endDate: string;
  dailyLateFee: number;
  agreementDuration: number;
  finalPrice: number;
  downPayment: number;
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
      agreementDuration: 12,
      finalPrice: 0,
      downPayment: 0,
    }
  });

  const onSubmit = async (data: AgreementFormData) => {
    try {
      console.log("Starting agreement creation with data:", data);

      // First create or get customer
      const { data: customerData, error: customerError } = await supabase
        .from('profiles')
        .insert({
          full_name: data.fullName,
          phone_number: data.phoneNumber,
          email: data.email,
          address: data.address,
          nationality: data.nationality,
          driver_license: data.drivingLicense,
          role: 'customer'
        })
        .select()
        .single();

      if (customerError) {
        // If insert fails, try to find existing customer
        const { data: existingCustomer, error: findError } = await supabase
          .from('profiles')
          .select()
          .eq('phone_number', data.phoneNumber)
          .single();

        if (findError) {
          throw new Error('Failed to create or find customer');
        }
        
        console.log("Found existing customer:", existingCustomer);
        data.customerId = existingCustomer.id;
      } else {
        console.log("Created new customer:", customerData);
        data.customerId = customerData.id;
      }

      // Format the data to match the database schema
      const formattedData = {
        customer_id: data.customerId,
        vehicle_id: data.vehicleId,
        agreement_type: data.agreementType,
        rent_amount: Number(data.rentAmount) || 0,
        total_amount: Number(data.finalPrice) || 0,
        agreement_duration: `${data.agreementDuration} months`,
        start_date: data.startDate,
        end_date: data.endDate,
        daily_late_fee: Number(data.dailyLateFee) || 120,
        down_payment: Number(data.downPayment) || 0,
        notes: data.notes,
        status: 'pending_payment' as LeaseStatus,
        initial_mileage: 0
      };

      console.log("Formatted data for agreement creation:", formattedData);

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

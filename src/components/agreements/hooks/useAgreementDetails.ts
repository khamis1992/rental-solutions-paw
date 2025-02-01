import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Agreement } from "@/types/agreement.types";

export const useAgreementDetails = (agreementId: string, enabled: boolean) => {
  const { data: agreement, isLoading } = useQuery({
    queryKey: ['agreement-details', agreementId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leases')
        .select(`
          *,
          customer:customer_id (
            id,
            full_name,
            phone_number,
            email
          ),
          vehicle:vehicle_id (
            id,
            make,
            model,
            year,
            license_plate
          ),
          remaining_amounts!remaining_amounts_lease_id_fkey (
            remaining_amount
          )
        `)
        .eq('id', agreementId)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        throw new Error('Agreement not found');
      }

      // Transform the data to match the Agreement type
      const transformedData: Agreement = {
        ...data,
        remaining_amount: data.remaining_amounts?.remaining_amount || 0,
        rent_amount: data.rent_amount || 0,
        daily_late_fee: data.daily_late_fee || 0,
        customer: data.customer,
        vehicle: data.vehicle
      };

      return transformedData;
    },
    enabled: enabled && !!agreementId,
  });

  return {
    agreement,
    isLoading
  };
};
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
            address
          ),
          vehicle:vehicle_id (
            id,
            make,
            model,
            year,
            license_plate
          )
        `)
        .eq('id', agreementId)
        .single();

      if (error) throw error;
      return data as Agreement;
    },
    enabled: enabled && !!agreementId,
  });

  return {
    agreement,
    isLoading
  };
};
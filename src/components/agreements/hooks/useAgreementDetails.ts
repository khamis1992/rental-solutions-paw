import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useAgreementDetails = (agreementId: string, enabled: boolean) => {
  const { data: agreement, isLoading, error, refetch } = useQuery({
    queryKey: ['agreement-details', agreementId],
    queryFn: async () => {
      try {
        const { data: agreement, error } = await supabase
          .from('leases')
          .select(`
            *,
            customer:customer_id (
              id,
              full_name,
              phone_number,
              address,
              email,
              nationality
            ),
            vehicle:vehicle_id (
              id,
              make,
              model,
              year,
              license_plate
            ),
            remainingAmount:remaining_amounts!remaining_amounts_lease_id_fkey (
              rent_amount,
              final_price,
              remaining_amount
            )
          `)
          .eq('id', agreementId)
          .maybeSingle();

        if (error) {
          console.error('Error fetching agreement:', error);
          toast.error('Failed to fetch agreement details');
          throw error;
        }

        if (!agreement) {
          toast.error('Agreement not found');
          return null;
        }

        // Transform the remainingAmount array to a single value
        const remainingAmountValue = agreement.remainingAmount?.[0]?.remaining_amount || 0;
        return {
          ...agreement,
          remainingAmount: remainingAmountValue
        };

      } catch (error) {
        console.error('Error in agreement query:', error);
        throw error;
      }
    },
    enabled: enabled && !!agreementId,
  });

  return {
    agreement,
    isLoading,
    error,
    refetch
  };
};
import { useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useAgreementDetails = (agreementId: string, open: boolean) => {
  const queryClient = useQueryClient();

  const { data: agreement, isLoading } = useQuery({
    queryKey: ['agreement-details', agreementId],
    queryFn: async () => {
      console.log('Fetching agreement details for:', agreementId);
      
      const { data: agreement, error: agreementError } = await supabase
        .from('leases')
        .select(`
          *,
          customer:profiles (
            id,
            full_name,
            phone_number,
            address
          ),
          vehicle:vehicles (
            id,
            make,
            model,
            year,
            license_plate
          ),
          remainingAmount:remaining_amounts (
            rent_amount,
            final_price,
            remaining_amount
          )
        `)
        .eq('id', agreementId)
        .maybeSingle();

      if (agreementError) {
        console.error('Error fetching agreement:', agreementError);
        throw agreementError;
      }

      if (!agreement) {
        console.error('Agreement not found');
        return null;
      }

      console.log('Fetched agreement:', agreement);
      
      return {
        ...agreement,
        remainingAmount: agreement?.remainingAmount?.[0] || {
          rent_amount: 0,
          final_price: 0,
          remaining_amount: 0
        }
      };
    },
    enabled: !!agreementId && open,
  });

  // Set up real-time subscription for both leases and remaining_amounts tables
  useEffect(() => {
    if (!agreementId || !open) return;

    console.log('Setting up real-time subscriptions for agreement:', agreementId);

    const channel = supabase
      .channel('agreement-details-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leases',
          filter: `id=eq.${agreementId}`
        },
        async (payload) => {
          console.log('Real-time update received for agreement:', payload);
          await queryClient.invalidateQueries({ queryKey: ['agreement-details', agreementId] });
          toast.info('Agreement details updated');
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'remaining_amounts',
          filter: `lease_id=eq.${agreementId}`
        },
        async (payload) => {
          console.log('Real-time update received for remaining amounts:', payload);
          await queryClient.invalidateQueries({ queryKey: ['agreement-details', agreementId] });
          toast.info('Remaining amounts updated');
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up subscriptions');
      supabase.removeChannel(channel);
    };
  }, [agreementId, open, queryClient]);

  return { agreement, isLoading };
};
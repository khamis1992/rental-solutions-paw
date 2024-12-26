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
      const [
        { data: agreement, error: agreementError }, 
        { data: remainingAmount, error: remainingError }
      ] = await Promise.all([
        supabase
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
            )
          `)
          .eq('id', agreementId)
          .single(),
        supabase
          .from('remaining_amounts')
          .select('*')
          .eq('lease_id', agreementId)
          .maybeSingle()
      ]);

      if (agreementError) throw agreementError;
      
      return {
        ...agreement,
        remainingAmount
      };
    },
    enabled: !!agreementId && open,
  });

  // Set up real-time subscription for both leases and remaining_amounts tables
  useEffect(() => {
    if (!agreementId || !open) return;

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
      supabase.removeChannel(channel);
    };
  }, [agreementId, open, queryClient]);

  return { agreement, isLoading };
};
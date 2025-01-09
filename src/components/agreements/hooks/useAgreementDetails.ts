import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { calculateContractValue } from "../utils/agreementCalculations";

export const useAgreementDetails = (agreementId: string, open: boolean) => {
  const queryClient = useQueryClient();

  const { data: agreement, isLoading } = useQuery({
    queryKey: ['agreement-details', agreementId],
    queryFn: async () => {
      console.log('Fetching agreement details for:', agreementId);
      
      // Fetch agreement details
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

      // Fetch payment history to calculate total payments
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('amount, status')
        .eq('lease_id', agreementId)
        .eq('status', 'completed');

      if (paymentsError) {
        console.error('Error fetching payments:', paymentsError);
        throw paymentsError;
      }

      // Calculate total payments
      const totalPayments = payments?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;

      // Calculate contract value
      const contractValue = calculateContractValue(
        Number(agreement.rent_amount) || 0,
        Number(agreement.agreement_duration?.toString() || '3') || 0
      );

      // Calculate remaining amount
      const remainingAmount = Math.max(0, contractValue - totalPayments);

      console.log('Contract Value:', contractValue);
      console.log('Total Payments:', totalPayments);
      console.log('Remaining Amount:', remainingAmount);
      
      return {
        ...agreement,
        contractValue,
        totalPayments,
        remainingAmount
      };
    },
    enabled: !!agreementId && open,
  });

  // Set up real-time subscription for agreement changes
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
          table: 'payments',
          filter: `lease_id=eq.${agreementId}`
        },
        async (payload) => {
          console.log('Real-time update received for payments:', payload);
          await queryClient.invalidateQueries({ queryKey: ['agreement-details', agreementId] });
          toast.info('Payment information updated');
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
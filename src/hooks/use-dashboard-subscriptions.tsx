import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useDashboardSubscriptions = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log("Setting up real-time subscriptions");

    // Payments subscription
    const paymentsChannel = supabase
      .channel('payments-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'payments' },
        async (payload) => {
          console.log('Payment update received:', payload);
          await queryClient.invalidateQueries({ queryKey: ['payments'] });
          toast.info('Payment data updated');
        }
      )
      .subscribe((status) => {
        console.log('Payments subscription status:', status);
      });

    // Agreements subscription
    const agreementsChannel = supabase
      .channel('agreements-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'leases' },
        async (payload) => {
          console.log('Agreement update received:', payload);
          await queryClient.invalidateQueries({ queryKey: ['agreements'] });
          toast.info('Agreement data updated');
        }
      )
      .subscribe((status) => {
        console.log('Agreements subscription status:', status);
      });

    // Vehicles subscription
    const vehiclesChannel = supabase
      .channel('vehicles-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'vehicles' },
        async (payload) => {
          console.log('Vehicle update received:', payload);
          await queryClient.invalidateQueries({ queryKey: ['vehicles'] });
          toast.info('Vehicle data updated');
        }
      )
      .subscribe((status) => {
        console.log('Vehicles subscription status:', status);
      });

    return () => {
      console.log("Cleaning up subscriptions");
      supabase.removeChannel(paymentsChannel);
      supabase.removeChannel(agreementsChannel);
      supabase.removeChannel(vehiclesChannel);
    };
  }, [queryClient]);
};
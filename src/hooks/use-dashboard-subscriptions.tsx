import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useDashboardSubscriptions = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Create a single channel for all subscriptions
    const channel = supabase.channel('dashboard-changes');

    // Subscribe to vehicle changes
    channel.on(
      'postgres_changes' as any,
      {
        event: '*',
        schema: 'public',
        table: 'vehicles'
      },
      () => {
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      }
    );

    // Subscribe to lease changes
    channel.on(
      'postgres_changes' as any,
      {
        event: '*',
        schema: 'public',
        table: 'leases'
      },
      () => {
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        queryClient.invalidateQueries({ queryKey: ['agreements'] });
      }
    );

    // Subscribe to payment changes
    channel.on(
      'postgres_changes' as any,
      {
        event: '*',
        schema: 'public',
        table: 'payments'
      },
      () => {
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        queryClient.invalidateQueries({ queryKey: ['payments'] });
      }
    );

    // Subscribe to the channel
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('Successfully subscribed to dashboard changes');
      } else if (status === 'CLOSED') {
        console.log('Subscription to dashboard changes closed');
        toast.error('Lost connection to real-time updates');
      } else if (status === 'CHANNEL_ERROR') {
        console.error('Error in dashboard subscription channel');
        toast.error('Error in real-time updates connection');
      }
    });

    // Cleanup subscription on unmount
    return () => {
      channel.unsubscribe();
    };
  }, [queryClient]);
};
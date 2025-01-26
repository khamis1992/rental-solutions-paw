import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useDashboardSubscriptions = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    let retryTimeout: number;
    let isSubscribed = false;
    
    // Create a single channel for all subscriptions
    const channel = supabase.channel('dashboard-changes');

    const handleSubscribe = () => {
      if (isSubscribed) return;

      // Clear any existing retry timeout
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }

      channel
        .on(
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
        )
        .on(
          'postgres_changes' as any,
          {
            event: '*',
            schema: 'public',
            table: 'leases'
          },
          () => {
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
            queryClient.invalidateQueries({ queryKey: ['agreements'] });
            queryClient.invalidateQueries({ queryKey: ['active-rent-amounts'] });
          }
        )
        .on(
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
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('Successfully subscribed to dashboard changes');
            isSubscribed = true;
          } else if (status === 'CLOSED') {
            console.log('Subscription to dashboard changes closed');
            isSubscribed = false;
            toast.error('Lost connection to real-time updates. Attempting to reconnect...');
            
            // Attempt to resubscribe after a delay
            retryTimeout = window.setTimeout(() => {
              handleSubscribe();
            }, 5000);
          } else if (status === 'CHANNEL_ERROR') {
            console.error('Error in dashboard subscription channel');
            isSubscribed = false;
            toast.error('Error in real-time updates connection. Attempting to reconnect...');
            
            // Attempt to resubscribe after a delay
            retryTimeout = window.setTimeout(() => {
              handleSubscribe();
            }, 5000);
          }
        });
    };

    // Initial subscription
    handleSubscribe();

    // Cleanup subscription on unmount
    return () => {
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
      isSubscribed = false;
      channel.unsubscribe();
    };
  }, [queryClient]);
};
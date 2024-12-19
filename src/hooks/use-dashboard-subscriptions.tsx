import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useDashboardSubscriptions = () => {
  useEffect(() => {
    // Subscribe to real-time updates
    const channel = supabase
      .channel('dashboard-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vehicles'
        },
        (payload) => {
          console.log('Vehicle update:', payload);
          toast.info('Vehicle information updated');
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'maintenance'
        },
        (payload) => {
          console.log('Maintenance update:', payload);
          toast.info('Maintenance schedule updated');
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leases'
        },
        (payload) => {
          console.log('Lease update:', payload);
          toast.info('Rental agreement updated');
        }
      )
      .subscribe((status, err) => {  // Added missing error parameter
        if (err) {
          console.error('Subscription error:', err);
        } else {
          console.log('Subscription status:', status);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
};
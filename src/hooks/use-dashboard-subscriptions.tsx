import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useDashboardSubscriptions = () => {
  const subscriptionRef = useRef<any>(null);

  useEffect(() => {
    if (subscriptionRef.current) {
      return;
    }

    subscriptionRef.current = supabase
      .channel('dashboard-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leases'
        },
        (payload) => {
          console.log('Change received!', payload);
        }
      )
      .subscribe();

    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
        subscriptionRef.current = null;
      }
    };
  }, []);
};
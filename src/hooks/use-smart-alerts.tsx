import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useSmartAlerts = () => {
  useEffect(() => {
    const channel = supabase
      .channel('smart-alerts')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'operational_anomalies'
        },
        (payload) => {
          console.log('Anomaly detected:', payload);
          toast.warning('System anomaly detected');
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ai_insights'
        },
        (payload) => {
          console.log('New AI insight:', payload);
          toast.info('New system insight available');
        }
      )
      .subscribe((status, err) => {  // Added missing error parameter
        if (err) {
          console.error('Alert subscription error:', err);
        } else {
          console.log('Alert subscription status:', status);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
};
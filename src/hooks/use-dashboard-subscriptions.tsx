import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

export const useDashboardSubscriptions = () => {
  const queryClient = useQueryClient();

  const handleDatabaseChange = useCallback((payload: any) => {
    const { table, eventType, new: newRecord, old: oldRecord } = payload;
    
    // Invalidate relevant queries based on the table that changed
    const invalidateQueries = async () => {
      switch (table) {
        case 'vehicles':
          await queryClient.invalidateQueries({ queryKey: ['vehicles'] });
          toast.info('Vehicle information updated');
          break;
        case 'maintenance':
          await queryClient.invalidateQueries({ queryKey: ['maintenance'] });
          toast.info('Maintenance schedule updated');
          break;
        case 'leases':
          await queryClient.invalidateQueries({ queryKey: ['leases'] });
          toast.info('Rental agreement updated');
          break;
        case 'payments':
          await queryClient.invalidateQueries({ queryKey: ['payments'] });
          toast.info('Payment information updated');
          break;
        case 'traffic_fines':
          await queryClient.invalidateQueries({ queryKey: ['traffic-fines'] });
          toast.info('Traffic fine information updated');
          break;
      }
    };

    invalidateQueries();
  }, [queryClient]);

  useEffect(() => {
    const channel = supabase
      .channel('dashboard-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          tables: ['vehicles', 'maintenance', 'leases', 'payments', 'traffic_fines']
        },
        handleDatabaseChange
      )
      .subscribe((status, err) => {
        if (err) {
          console.error('Subscription error:', err);
          toast.error('Failed to subscribe to database changes');
        } else {
          console.log('Subscription status:', status);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [handleDatabaseChange]);
};
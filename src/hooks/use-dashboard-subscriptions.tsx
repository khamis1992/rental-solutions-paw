import { useEffect } from 'react';
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export const useDashboardSubscriptions = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Set up real-time subscriptions for dashboard data with optimized channels
    const channels = [
      supabase
        .channel('vehicle-status-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'vehicles' },
          async (payload) => {
            console.log('Vehicle status changed, refreshing stats...');
            await queryClient.invalidateQueries({
              queryKey: ['vehicle-status-counts'],
              exact: true,
              refetchType: 'active'
            });
          }
        )
        .subscribe(),

      supabase
        .channel('rental-updates')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'leases' },
          async (payload) => {
            console.log('Rental status changed, refreshing upcoming rentals...');
            await queryClient.invalidateQueries({
              queryKey: ['upcoming-rentals'],
              exact: true,
              refetchType: 'active'
            });
          }
        )
        .subscribe(),

      supabase
        .channel('alert-updates')
        .on(
          'postgres_changes',
          { 
            event: '*', 
            schema: 'public', 
            table: 'maintenance',
            filter: "status=in.(scheduled,in_progress)" 
          },
          async (payload) => {
            console.log('Maintenance alert changed, refreshing alerts...');
            await queryClient.invalidateQueries({
              queryKey: ['dashboard-alerts'],
              exact: true,
              refetchType: 'active'
            });
          }
        )
        .subscribe()
    ];

    // Error handling for real-time subscriptions
    channels.forEach(channel => {
      channel.on('error', (error) => {
        console.error('Realtime subscription error:', error);
        toast.error('Error in real-time updates. Trying to reconnect...', {
          duration: 5000,
        });
      });
    });

    return () => {
      channels.forEach(channel => {
        channel.unsubscribe();
      });
    };
  }, [queryClient]);
};
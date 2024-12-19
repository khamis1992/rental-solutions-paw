import { useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

export const useSmartAlerts = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channels = [
      // Monitor payment schedules for overdue payments
      supabase
        .channel('payment-alerts')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'payment_schedules',
            filter: "status=eq.'pending' AND due_date<now()"
          },
          (payload) => {
            toast.warning('Overdue payment detected', {
              description: 'There are payments that require immediate attention.',
              action: {
                label: 'View',
                onClick: () => window.location.href = '/payments'
              }
            });
          }
        )
        .subscribe(),

      // Monitor maintenance schedules
      supabase
        .channel('maintenance-alerts')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'maintenance',
            filter: "status=eq.'scheduled' AND scheduled_date<now()"
          },
          (payload) => {
            toast.warning('Overdue maintenance detected', {
              description: 'There are vehicles requiring immediate maintenance.',
              action: {
                label: 'View',
                onClick: () => window.location.href = '/maintenance'
              }
            });
          }
        )
        .subscribe(),

      // Monitor lease agreements nearing expiration
      supabase
        .channel('lease-alerts')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'leases',
            filter: "status=eq.'active' AND end_date<(now() + interval '7 days')"
          },
          (payload) => {
            toast.info('Lease agreement expiring soon', {
              description: 'There are lease agreements that need attention.',
              action: {
                label: 'View',
                onClick: () => window.location.href = '/agreements'
              }
            });
          }
        )
        .subscribe(),

      // Monitor audit logs for validation errors
      supabase
        .channel('validation-alerts')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'audit_logs',
            filter: "action=eq.'data_validation'"
          },
          (payload: any) => {
            if (payload.new.changes?.validation_errors) {
              toast.error('Data validation errors detected', {
                description: 'Please review the entered information.',
              });
            }
          }
        )
        .subscribe()
    ];

    // Error handling for real-time subscriptions
    channels.forEach(channel => {
      channel.on('error', (error) => {
        console.error('Smart alerts subscription error:', error);
        toast.error('Error in alert system. Trying to reconnect...');
      });
    });

    return () => {
      channels.forEach(channel => {
        if (channel.unsubscribe) {
          channel.unsubscribe();
        }
      });
    };
  }, []);

  const validateData = async (entityType: 'customer' | 'vehicle' | 'lease', data: Record<string, any>) => {
    try {
      const { data: response, error } = await supabase.functions.invoke('validate-data-entry', {
        body: { entityType, data }
      });

      if (error) throw error;

      if (!response.success) {
        Object.entries(response.errors).forEach(([field, message]) => {
          toast.error(`Validation Error: ${message}`, {
            description: `Please check the ${field} field.`
          });
        });
      }

      return response;
    } catch (error) {
      console.error('Error validating data:', error);
      toast.error('Error validating data. Please try again.');
      return { success: false, errors: { general: 'Validation failed' } };
    }
  };

  return { validateData };
};
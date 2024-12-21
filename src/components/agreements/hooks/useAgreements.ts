import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useEffect } from "react";

export interface Agreement {
  id: string;
  agreement_number: string;
  license_no: string;
  customer: {
    id: string;
    full_name: string;
  };
  vehicle: {
    id: string;
    make: string;
    model: string;
    year: number;
    license_plate: string;
  };
  start_date: string;
  end_date: string;
  status: string;
  total_amount: number;
}

export const useAgreements = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('agreement-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leases'
        },
        async (payload) => {
          console.log('Agreement update received:', payload);
          await queryClient.invalidateQueries({ queryKey: ['agreements'] });
          
          const eventType = payload.eventType;
          const message = eventType === 'INSERT' 
            ? 'New agreement created'
            : eventType === 'UPDATE'
            ? 'Agreement updated'
            : 'Agreement deleted';
          
          toast.info(message, {
            description: 'The agreements list has been updated.'
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['agreements'],
    queryFn: async () => {
      // Optimize the query by selecting only needed fields
      const { data, error } = await supabase
        .from('leases')
        .select(`
          id,
          agreement_number,
          status,
          total_amount,
          start_date,
          end_date,
          profiles!inner (
            id,
            full_name
          ),
          vehicles!inner (
            id,
            make,
            model,
            year,
            license_plate
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching agreements:", error);
        toast.error("Failed to fetch agreements");
        throw error;
      }

      return data?.map(lease => ({
        id: lease.id,
        agreement_number: lease.agreement_number,
        customer: {
          id: lease.profiles.id,
          full_name: lease.profiles.full_name,
        },
        vehicle: {
          id: lease.vehicles.id,
          make: lease.vehicles.make,
          model: lease.vehicles.model,
          year: lease.vehicles.year,
          license_plate: lease.vehicles.license_plate,
        },
        start_date: lease.start_date,
        end_date: lease.end_date,
        status: lease.status,
        total_amount: lease.total_amount,
      })) || [];
    },
  });
};
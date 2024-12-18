import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Agreement {
  id: string;
  customer: {
    id: string;
    full_name: string;
  };
  vehicle: {
    id: string;
    make: string;
    model: string;
    year: number;
  };
  start_date: string;
  end_date: string;
  status: string;
  total_amount: number;
}

export const useAgreements = () => {
  return useQuery({
    queryKey: ['agreements'],
    queryFn: async () => {
      console.log("Starting to fetch agreements...");
      
      // First, let's check if we have any leases at all without status filter
      const { count, error: countError } = await supabase
        .from('leases')
        .select('*', { count: 'exact', head: true });
        
      console.log("Total number of leases:", count);
      
      if (countError) {
        console.error("Error counting leases:", countError);
        toast.error("Failed to count agreements");
        throw countError;
      }

      // Now fetch the full data without status filter
      const { data, error } = await supabase
        .from('leases')
        .select(`
          id,
          checkout_date,
          checkin_date,
          status,
          total_amount,
          agreement_number,
          profiles!leases_customer_id_fkey (
            id,
            full_name
          ),
          vehicles!leases_vehicle_id_fkey (
            id,
            make,
            model,
            year
          )
        `);

      if (error) {
        console.error("Error fetching agreements:", error);
        toast.error("Failed to fetch agreements");
        throw error;
      }

      console.log("Raw agreements data:", data);
      
      const transformedData = data?.map((lease: any) => {
        console.log("Processing lease:", lease);
        return {
          id: lease.id,
          customer: {
            id: lease.profiles?.id || '',
            full_name: lease.profiles?.full_name || 'Unknown Customer',
          },
          vehicle: {
            id: lease.vehicles?.id || '',
            make: lease.vehicles?.make || '',
            model: lease.vehicles?.model || '',
            year: lease.vehicles?.year || '',
          },
          start_date: lease.checkout_date || '',
          end_date: lease.checkin_date || '',
          status: lease.status || 'pending',
          total_amount: lease.total_amount || 0,
        };
      }) || [];

      console.log("Transformed agreements data:", transformedData);
      return transformedData;
    },
  });
};
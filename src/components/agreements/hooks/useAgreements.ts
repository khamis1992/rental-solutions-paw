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
      
      // First, let's do a direct count of all leases
      const { count, error: countError } = await supabase
        .from('leases')
        .select('*', { count: 'exact', head: true });
        
      console.log("Total number of leases in database:", count);
      
      if (countError) {
        console.error("Error counting leases:", countError);
        toast.error("Failed to count agreements");
        throw countError;
      }

      // Now fetch all lease data with a simpler query first
      const { data: rawLeases, error: rawError } = await supabase
        .from('leases')
        .select('*');

      if (rawError) {
        console.error("Error fetching raw leases:", rawError);
        throw rawError;
      }

      console.log("Raw leases data (simplified query):", rawLeases);

      // Now fetch the full data with relationships
      const { data, error } = await supabase
        .from('leases')
        .select(`
          id,
          checkout_date,
          checkin_date,
          status,
          total_amount,
          agreement_number,
          customer_id,
          vehicle_id,
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
        console.error("Error fetching agreements with relationships:", error);
        toast.error("Failed to fetch agreements");
        throw error;
      }

      console.log("Full agreements data before transformation:", data);
      
      const transformedData = data?.map((lease: any) => {
        console.log("Processing lease:", lease);
        const transformed = {
          id: lease.id,
          customer: {
            id: lease.profiles?.id || lease.customer_id || '',
            full_name: lease.profiles?.full_name || 'Unknown Customer',
          },
          vehicle: {
            id: lease.vehicles?.id || lease.vehicle_id || '',
            make: lease.vehicles?.make || '',
            model: lease.vehicles?.model || '',
            year: lease.vehicles?.year || '',
          },
          start_date: lease.checkout_date || '',
          end_date: lease.checkin_date || '',
          status: lease.status || 'pending',
          total_amount: lease.total_amount || 0,
        };
        console.log("Transformed lease:", transformed);
        return transformed;
      }) || [];

      console.log("Final transformed agreements data:", transformedData);
      return transformedData;
    },
  });
};
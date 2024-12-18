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
      console.log("Fetching agreements...");
      const { data, error } = await supabase
        .from('leases')
        .select(`
          id,
          checkout_date,
          checkin_date,
          status,
          total_amount,
          customer:profiles!leases_customer_id_fkey (
            id,
            full_name
          ),
          vehicle:vehicles!leases_vehicle_id_fkey (
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
      
      return data?.map((lease: any) => ({
        id: lease.id,
        customer: {
          id: lease.customer?.id || '',
          full_name: lease.customer?.full_name || 'Unknown Customer',
        },
        vehicle: {
          id: lease.vehicle?.id || '',
          make: lease.vehicle?.make || '',
          model: lease.vehicle?.model || '',
          year: lease.vehicle?.year || '',
        },
        start_date: lease.checkout_date || '',
        end_date: lease.checkin_date || '',
        status: lease.status || 'pending',
        total_amount: lease.total_amount || 0,
      })) || [];
    },
  });
};
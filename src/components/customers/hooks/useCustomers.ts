import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useCustomers = (searchQuery: string, roleFilter: string, statusFilter: string) => {
  return useQuery({
    queryKey: ['customers', searchQuery, roleFilter, statusFilter],
    queryFn: async () => {
      try {
        console.log("Fetching customers with search:", searchQuery);
        let query = supabase
          .from('profiles')
          .select('*')
          .eq('role', 'customer');

        if (searchQuery) {
          query = query.or(`full_name.ilike.%${searchQuery}%,phone_number.ilike.%${searchQuery}%,driver_license.ilike.%${searchQuery}%`);
        }

        if (roleFilter !== 'all') {
          query = query.eq('role', roleFilter);
        }

        if (statusFilter !== 'all') {
          // You might need to adjust this based on how you determine status
          const hasActiveAgreements = statusFilter === 'active';
          query = query.eq('has_active_agreements', hasActiveAgreements);
        }

        const { data, error } = await query;

        if (error) {
          console.error("Error fetching customers:", error);
          toast.error("Failed to fetch customers");
          throw error;
        }
        
        console.log("Fetched customers:", data);
        return data || [];
      } catch (err) {
        console.error("Error in customer query:", err);
        toast.error("Failed to fetch customers");
        return [];
      }
    },
    retry: 1,
    staleTime: 30000,
  });
};
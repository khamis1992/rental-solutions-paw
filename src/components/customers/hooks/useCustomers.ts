import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useCustomers = (searchQuery: string, roleFilter: string) => {
  return useQuery({
    queryKey: ['customers', searchQuery, roleFilter],
    queryFn: async () => {
      try {
        console.log("Fetching customers with search:", searchQuery);
        let query = supabase
          .from('profiles')
          .select('*');

        if (searchQuery) {
          query = query.or(`full_name.ilike.%${searchQuery}%,phone_number.ilike.%${searchQuery}%,driver_license.ilike.%${searchQuery}%`);
        }

        if (roleFilter !== 'all') {
          query = query.eq('role', roleFilter);
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